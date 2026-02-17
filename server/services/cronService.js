const cron = require("node-cron");
const Medicine = require("../models/Medicine");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Define timing slots with their scheduled hours
const TIMING_SCHEDULE = {
	beforeBreakfast: { hour: 7, minute: 0, label: "Before Breakfast (7:00 AM)" },
	afterBreakfast: { hour: 9, minute: 0, label: "After Breakfast (9:00 AM)" },
	beforeLunch: { hour: 12, minute: 0, label: "Before Lunch (12:00 PM)" },
	afterLunch: { hour: 14, minute: 0, label: "After Lunch (2:00 PM)" },
	beforeDinner: { hour: 19, minute: 0, label: "Before Dinner (7:00 PM)" },
	afterDinner: { hour: 21, minute: 0, label: "After Dinner (9:00 PM)" },
};

// Grace period in minutes - after this, dose is considered missed
const MISSED_DOSE_GRACE_PERIOD = 60;

// Threshold for consecutive missed doses before notifying emergency contact
const CONSECUTIVE_MISSED_THRESHOLD = 5;

/**
 * Get today's date at start of day (midnight)
 */
const getTodayStart = () => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today;
};

/**
 * Get today's date at end of day
 */
const getTodayEnd = () => {
	const today = new Date();
	today.setHours(23, 59, 59, 999);
	return today;
};

/**
 * Get active medicines for today
 * Medicines where today is between startDate and endDate
 */
const getActiveMedicinesForToday = async () => {
	const today = getTodayStart();

	const medicines = await Medicine.find({
		startDate: { $lte: today },
		endDate: { $gte: today },
	}).populate("patientId", "name email phone");

	return medicines;
};

/**
 * Check and create medicine reminders for current timing slot
 * Skips medicines that are already marked as taken for this slot
 */
const checkMedicineReminders = async (timingSlot) => {
	try {
		console.log(`[CRON] Checking medicine reminders for: ${timingSlot}`);

		const medicines = await getActiveMedicinesForToday();
		const now = new Date();

		for (const medicine of medicines) {
			// Check if this medicine should be taken at this timing
			if (medicine.timing[timingSlot]) {
				// Skip if already taken for this timing slot
				if (medicine.taken && medicine.taken[timingSlot]) {
					console.log(
						`[CRON] Skipping ${medicine.medicineName} - already taken for ${timingSlot}`
					);
					continue;
				}

				// Check if notification already exists for this medicine, timing, and today
				const existingNotification = await Notification.findOne({
					medicineId: medicine._id,
					timing: timingSlot,
					type: "medicine_reminder",
					scheduledFor: {
						$gte: getTodayStart(),
						$lte: getTodayEnd(),
					},
				});

				if (!existingNotification) {
					// Create reminder notification
					const notification = new Notification({
						userId: medicine.patientId._id,
						medicineId: medicine._id,
						type: "medicine_reminder",
						title: "Medicine Reminder",
						message: `Time to take ${medicine.medicineName} - ${TIMING_SCHEDULE[timingSlot].label}`,
						timing: timingSlot,
						scheduledFor: now,
						isSent: false,
					});

					await notification.save();
					console.log(
						`[CRON] Created reminder for ${medicine.medicineName} for user ${medicine.patientId.name}`
					);
				}
			}
		}
	} catch (error) {
		console.error("[CRON] Error checking medicine reminders:", error);
	}
};

/**
 * Check for missed doses
 * A dose is missed if:
 * 1. The scheduled time has passed (grace period elapsed)
 * 2. The medicine is NOT marked as taken for that timing slot
 * 
 * Sends repeated missed dose notifications every 30 minutes until user takes the medicine
 */
const checkMissedDoses = async () => {
	try {
		console.log("[CRON] Checking for missed doses...");

		const now = new Date();
		const medicines = await getActiveMedicinesForToday();

		for (const medicine of medicines) {
			// Check each timing slot
			for (const [timingSlot, isScheduled] of Object.entries(medicine.timing.toObject())) {
				if (!isScheduled || !TIMING_SCHEDULE[timingSlot]) continue;

				// Skip if already taken - no missed dose notification needed
				if (medicine.taken && medicine.taken[timingSlot]) {
					continue;
				}

				// Calculate scheduled time for this slot today
				const scheduledTime = new Date();
				scheduledTime.setHours(TIMING_SCHEDULE[timingSlot].hour, TIMING_SCHEDULE[timingSlot].minute, 0, 0);

				// Check if grace period has passed (60 minutes after scheduled time)
				const graceEndTime = new Date(scheduledTime.getTime() + MISSED_DOSE_GRACE_PERIOD * 60 * 1000);
				
				if (now < graceEndTime) {
					// Still within grace period, not missed yet
					continue;
				}

				// Check when was the last missed dose notification sent for this medicine+timing today
				const lastMissedNotification = await Notification.findOne({
					medicineId: medicine._id,
					timing: timingSlot,
					type: "missed_dose",
					scheduledFor: {
						$gte: getTodayStart(),
						$lte: getTodayEnd(),
					},
				}).sort({ scheduledFor: -1 });

				// Send a new missed dose notification every 30 minutes
				const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
				
				if (!lastMissedNotification || lastMissedNotification.scheduledFor < thirtyMinutesAgo) {
					// Create missed dose notification
					const notification = new Notification({
						userId: medicine.patientId._id,
						medicineId: medicine._id,
						type: "missed_dose",
						title: "Missed Dose Alert",
						message: `You missed your dose of ${medicine.medicineName} - ${TIMING_SCHEDULE[timingSlot].label}. Please take it now!`,
						timing: timingSlot,
						scheduledFor: now,
						isSent: false,
					});

					await notification.save();
					console.log(
						`[CRON] Created missed dose notification for ${medicine.medicineName} (${timingSlot}) for user ${medicine.patientId.name}`
					);
				}
			}
		}
	} catch (error) {
		console.error("[CRON] Error checking missed doses:", error);
	}
};

/**
 * Check for expired medicines and medicines expiring soon
 */
const checkExpiredMedicines = async () => {
	try {
		console.log("[CRON] Checking for expired medicines...");

		const today = getTodayStart();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const threeDaysFromNow = new Date(today);
		threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

		// Find medicines that expired today
		const expiredMedicines = await Medicine.find({
			endDate: {
				$gte: today,
				$lt: tomorrow,
			},
		}).populate("patientId", "name email phone");

		for (const medicine of expiredMedicines) {
			// Check if expiry notification already exists
			const existingNotification = await Notification.findOne({
				medicineId: medicine._id,
				type: "medicine_expired",
				scheduledFor: {
					$gte: today,
					$lte: getTodayEnd(),
				},
			});

			if (!existingNotification) {
				const notification = new Notification({
					userId: medicine.patientId._id,
					medicineId: medicine._id,
					type: "medicine_expired",
					title: "Medicine Course Completed",
					message: `Your course of ${medicine.medicineName} has ended today. Please consult your doctor if needed.`,
					timing: null,
					scheduledFor: new Date(),
					isSent: false,
				});

				await notification.save();
				console.log(
					`[CRON] Created expiry notification for ${medicine.medicineName}`
				);
			}
		}

		// Find medicines expiring in next 3 days (for advance warning)
		const expiringMedicines = await Medicine.find({
			endDate: {
				$gt: tomorrow,
				$lte: threeDaysFromNow,
			},
		}).populate("patientId", "name email phone");

		for (const medicine of expiringMedicines) {
			// Check if expiring soon notification already exists
			const existingNotification = await Notification.findOne({
				medicineId: medicine._id,
				type: "medicine_expiring_soon",
				scheduledFor: {
					$gte: today,
					$lte: getTodayEnd(),
				},
			});

			if (!existingNotification) {
				const daysLeft = Math.ceil(
					(medicine.endDate - today) / (1000 * 60 * 60 * 24)
				);

				const notification = new Notification({
					userId: medicine.patientId._id,
					medicineId: medicine._id,
					type: "medicine_expiring_soon",
					title: "Medicine Course Ending Soon",
					message: `Your course of ${medicine.medicineName} will end in ${daysLeft} days. Please consult your doctor for renewal if needed.`,
					timing: null,
					scheduledFor: new Date(),
					isSent: false,
				});

				await notification.save();
				console.log(
					`[CRON] Created expiring soon notification for ${medicine.medicineName}`
				);
			}
		}
	} catch (error) {
		console.error("[CRON] Error checking expired medicines:", error);
	}
};

/**
 * Create notification when a new medicine is added
 * This is called from the prescription route, not from cron
 */
const createNewMedicineNotification = async (medicine, patientId) => {
	try {
		// Build timing string
		const timings = [];
		for (const [key, value] of Object.entries(medicine.timing)) {
			if (value && TIMING_SCHEDULE[key]) {
				timings.push(TIMING_SCHEDULE[key].label);
			}
		}

		const notification = new Notification({
			userId: patientId,
			medicineId: medicine._id,
			type: "new_medicine_added",
			title: "New Medicine Added",
			message: `${medicine.medicineName} has been added to your prescription. Take it at: ${timings.join(", ")}`,
			timing: null,
			scheduledFor: new Date(),
			isSent: false,
		});

		await notification.save();
		console.log(`[NOTIFICATION] Created new medicine notification for ${medicine.medicineName}`);

		return notification;
	} catch (error) {
		console.error("[NOTIFICATION] Error creating new medicine notification:", error);
		throw error;
	}
};

/**
 * Get pending notifications that need to be sent
 * This is for the notification service to pick up
 */
const getPendingNotifications = async () => {
	try {
		const notifications = await Notification.find({
			isSent: false,
			scheduledFor: { $lte: new Date() },
		})
			.populate("userId", "name email phone")
			.populate("medicineId", "medicineName")
			.sort({ scheduledFor: 1 });

		return notifications;
	} catch (error) {
		console.error("[NOTIFICATION] Error getting pending notifications:", error);
		throw error;
	}
};

/**
 * Mark notification as sent
 */
const markNotificationAsSent = async (notificationId) => {
	try {
		await Notification.findByIdAndUpdate(notificationId, { isSent: true });
	} catch (error) {
		console.error("[NOTIFICATION] Error marking notification as sent:", error);
		throw error;
	}
};

/**
 * Count and record missed doses before daily reset
 * Checks which scheduled timings were not taken and increments missedCount
 * Also tracks consecutive missed doses and notifies emergency contacts if threshold reached
 */
const countMissedDosesBeforeReset = async () => {
	try {
		console.log("[CRON] Counting missed doses before daily reset...");

		const today = getTodayStart();

		// Get all active medicines with patient info
		const medicines = await Medicine.find({
			startDate: { $lte: today },
			endDate: { $gte: today },
		}).populate("patientId", "name email phone emergencyContact");

		for (const medicine of medicines) {
			let missedToday = 0;

			// Check each timing slot
			for (const [slot, isScheduled] of Object.entries(medicine.timing.toObject())) {
				// If this slot was scheduled but not taken, it's missed
				if (isScheduled && !medicine.taken[slot]) {
					missedToday += 1;
				}
			}

			// Update missedCount and consecutiveMissedCount if any doses were missed
			if (missedToday > 0) {
				medicine.missedCount += missedToday;
				medicine.consecutiveMissedCount += missedToday;
				await medicine.save();
				console.log(
					`[CRON] ${medicine.medicineName}: ${missedToday} missed doses recorded (total: ${medicine.missedCount}, consecutive: ${medicine.consecutiveMissedCount})`
				);

				// Check if consecutive missed count reaches threshold for emergency contact notification
				if (medicine.consecutiveMissedCount >= CONSECUTIVE_MISSED_THRESHOLD && !medicine.emergencyContactNotified) {
					await notifyEmergencyContact(medicine, medicine.patientId);
				}
			}
		}
	} catch (error) {
		console.error("[CRON] Error counting missed doses:", error);
	}
};

/**
 * Notify emergency contact when user misses medicines consecutively
 */
const notifyEmergencyContact = async (medicine, patient) => {
	try {
		// Check if patient has emergency contact configured
		if (!patient.emergencyContact || !patient.emergencyContact.phone) {
			console.log(`[CRON] No emergency contact configured for patient ${patient.name}`);
			return;
		}

		const emergencyContact = patient.emergencyContact;
		const relationshipText = emergencyContact.relationship || "family member";
		const emergencyContactName = emergencyContact.name || "Emergency Contact";

		console.log(`[CRON] Notifying emergency contact for ${patient.name} - ${medicine.medicineName} missed ${medicine.consecutiveMissedCount} times`);

		// Create notification for emergency contact
		const notification = new Notification({
			userId: patient._id,
			medicineId: medicine._id,
			type: "emergency_contact_alert",
			title: "Medication Alert - Immediate Attention Required",
			message: `Your ${relationshipText} ${patient.name} has missed their medication "${medicine.medicineName}" ${medicine.consecutiveMissedCount} times consecutively. Please check on them and ensure they are taking their prescribed medicines.`,
			timing: null,
			scheduledFor: new Date(),
			isSent: false,
			isEmergencyContactNotification: true,
			emergencyContactPhone: emergencyContact.phone,
			emergencyContactName: emergencyContactName,
		});

		await notification.save();

		// Update medicine to mark emergency contact as notified
		medicine.emergencyContactNotified = true;
		medicine.lastEmergencyNotificationDate = new Date();
		await medicine.save();

		console.log(
			`[CRON] Emergency contact notification created for ${emergencyContactName} (${emergencyContact.phone}) regarding ${patient.name}'s medicine: ${medicine.medicineName}`
		);
	} catch (error) {
		console.error("[CRON] Error notifying emergency contact:", error);
	}
};

/**
 * Check for medicines with high consecutive missed doses and notify emergency contacts
 * This runs periodically to catch cases that might have been missed
 */
const checkConsecutiveMissedDoses = async () => {
	try {
		console.log("[CRON] Checking for consecutive missed doses...");

		const today = getTodayStart();

		// Find medicines with consecutive misses >= threshold and emergency contact not notified
		const medicines = await Medicine.find({
			startDate: { $lte: today },
			endDate: { $gte: today },
			consecutiveMissedCount: { $gte: CONSECUTIVE_MISSED_THRESHOLD },
			emergencyContactNotified: false,
		}).populate("patientId", "name email phone emergencyContact");

		for (const medicine of medicines) {
			if (medicine.patientId) {
				await notifyEmergencyContact(medicine, medicine.patientId);
			}
		}

		console.log(`[CRON] Checked ${medicines.length} medicines for emergency contact notification`);
	} catch (error) {
		console.error("[CRON] Error checking consecutive missed doses:", error);
	}
};

/**
 * Reset all taken statuses at midnight
 * This runs at 12:00 AM every day to reset the taken flags for all active medicines
 */
const resetDailyTakenStatus = async () => {
	try {
		console.log("[CRON] Resetting daily taken status for all medicines...");

		// First count missed doses before resetting
		await countMissedDosesBeforeReset();

		const today = getTodayStart();

		// Reset taken status for all active medicines
		const result = await Medicine.updateMany(
			{
				startDate: { $lte: today },
				endDate: { $gte: today },
			},
			{
				$set: {
					"taken.beforeBreakfast": false,
					"taken.afterBreakfast": false,
					"taken.beforeLunch": false,
					"taken.afterLunch": false,
					"taken.beforeDinner": false,
					"taken.afterDinner": false,
					lastResetDate: today,
				},
			}
		);

		console.log(
			`[CRON] Reset taken status for ${result.modifiedCount} medicines`
		);
	} catch (error) {
		console.error("[CRON] Error resetting daily taken status:", error);
	}
};

/**
 * Initialize all cron jobs
 */
const initializeCronJobs = () => {
	console.log("[CRON] Initializing cron jobs...");

	// Reset taken status at midnight (12:00 AM)
	cron.schedule("0 0 * * *", () => {
		resetDailyTakenStatus();
	});

	// Before Breakfast - 7:00 AM
	cron.schedule("0 7 * * *", () => {
		checkMedicineReminders("beforeBreakfast");
	});

	// After Breakfast - 9:00 AM
	cron.schedule("0 9 * * *", () => {
		checkMedicineReminders("afterBreakfast");
	});

	// Before Lunch - 12:00 PM
	cron.schedule("0 12 * * *", () => {
		checkMedicineReminders("beforeLunch");
	});

	// After Lunch - 2:00 PM
	cron.schedule("0 14 * * *", () => {
		checkMedicineReminders("afterLunch");
	});

	// Before Dinner - 7:00 PM
	cron.schedule("0 19 * * *", () => {
		checkMedicineReminders("beforeDinner");
	});

	// After Dinner - 9:00 PM
	cron.schedule("0 21 * * *", () => {
		checkMedicineReminders("afterDinner");
	});

	// Check for missed doses every 30 minutes
	cron.schedule("*/30 * * * *", () => {
		checkMissedDoses();
	});

	// Check for expired medicines every day at 8:00 AM
	cron.schedule("0 8 * * *", () => {
		checkExpiredMedicines();
	});

	// Check for consecutive missed doses and notify emergency contacts every 2 hours
	cron.schedule("0 */2 * * *", () => {
		checkConsecutiveMissedDoses();
	});

	// Check pending notifications every minute (for the notification service to pick up)
	cron.schedule("* * * * *", async () => {
		const pending = await getPendingNotifications();
		if (pending.length > 0) {
			console.log(`[CRON] ${pending.length} pending notifications ready to send`);
			// The notification service (other team member) will handle the actual sending
		}
	});

	console.log("[CRON] All cron jobs initialized successfully");
};

module.exports = {
	initializeCronJobs,
	checkMedicineReminders,
	checkMissedDoses,
	checkExpiredMedicines,
	checkConsecutiveMissedDoses,
	notifyEmergencyContact,
	createNewMedicineNotification,
	getPendingNotifications,
	markNotificationAsSent,
	resetDailyTakenStatus,
	TIMING_SCHEDULE,
	CONSECUTIVE_MISSED_THRESHOLD,
};
