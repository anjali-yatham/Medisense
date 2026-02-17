const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Medicine = require("../models/Medicine");
const Notification = require("../models/Notification");
const {
	checkMedicineReminders,
	checkMissedDoses,
	checkExpiredMedicines,
	checkConsecutiveMissedDoses,
	getPendingNotifications,
	markNotificationAsSent,
	resetDailyTakenStatus,
	TIMING_SCHEDULE,
	CONSECUTIVE_MISSED_THRESHOLD,
} = require("../services/cronService");

// Auth middleware
const authMiddleware = async (req, res, next) => {
	try {
		const token = req.header("Authorization")?.replace("Bearer ", "");
		if (!token) {
			return res.status(401).json({ message: "No token provided" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.userId || decoded.id;
		next();
	} catch (error) {
		res.status(401).json({ message: "Invalid token" });
	}
};
/**
 * GET /api/medicines/today
 * Get medicines scheduled for today for the logged-in user with taken status
 */
router.get("/today", authMiddleware, async (req, res) => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const endOfToday = new Date();
		endOfToday.setHours(23, 59, 59, 999);

		const patientObjectId = new mongoose.Types.ObjectId(req.userId);

		const medicines = await Medicine.find({
			patientId: patientObjectId,
			startDate: { $lte: endOfToday },
			endDate: { $gte: today },
		}).populate("prescribedBy", "name");

		console.log(
			"Today's medicines for user:",
			req.userId,
			"Count:",
			medicines.length
		);

		// Format medicines with their timing schedule and taken status
		const formattedMedicines = medicines.map((med) => {
			const timings = [];
			for (const [key, value] of Object.entries(med.timing.toObject())) {
				if (value && TIMING_SCHEDULE[key]) {
					timings.push({
						slot: key,
						...TIMING_SCHEDULE[key],
						taken: med.taken ? med.taken[key] : false,
					});
				}
			}

			return {
				id: med._id,
				name: med.medicineName,
				quantity: med.quantity,
				takenCount: med.takenCount || 0,
				missedCount: med.missedCount || 0,
				prescribedBy: med.prescribedBy,
				startDate: med.startDate,
				endDate: med.endDate,
				timings,
			};
		});

		res.json({
			success: true,
			date: today.toISOString().split("T")[0],
			data: formattedMedicines,
		});
	} catch (error) {
		console.error("Error fetching today's medicines:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * GET /api/medicines/my-medicines
 * Get all medicines for the logged-in patient
 */
router.get("/my-medicines", authMiddleware, async (req, res) => {
	try {
		const medicines = await Medicine.find({
			patientId: req.userId,
		})
			.populate("prescribedBy", "name email")
			.populate("prescriptionId")
			.sort({ createdAt: -1 });

		res.json({
			success: true,
			medicines: medicines,
		});
	} catch (error) {
		console.error("Error fetching medicines:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * DELETE /api/medicines/:id
 * Delete a medicine entry (patient can delete their own medicines)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
	try {
		const medicine = await Medicine.findOne({
			_id: req.params.id,
			patientId: req.userId,
		});

		if (!medicine) {
			return res.status(404).json({ 
				message: "Medicine not found or you don't have permission to delete it" 
			});
		}

		await Medicine.findByIdAndDelete(req.params.id);

		res.json({
			success: true,
			message: "Medicine deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting medicine:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.get("/medicine-counts", authMiddleware, async (req, res) => {
	try {
		const patientObjectId = new mongoose.Types.ObjectId(req.userId);
		const medicines = await Medicine.find({
			patientId: patientObjectId,
		});
		console.log("Found medicines for user:", medicines.length);
		console.log(medicines);
		const medicineCounts = {};

		medicines.forEach((med) => {
			medicineCounts[med.medicineName] = [
				med.takenCount || 0,
				med.missedCount || 0,
			];
		});

		res.json({
			success: true,
			data: medicineCounts,
		});
	} catch (error) {
		console.error("Error fetching medicine counts:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * GET /api/medicines/stats
 * Get overall medicine stats for the user
 */
router.get("/stats", authMiddleware, async (req, res) => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const medicines = await Medicine.find({
			patientId: req.userId,
			startDate: { $lte: today },
			endDate: { $gte: today },
		});

		let totalTaken = 0;
		let totalMissed = 0;
		let totalScheduledToday = 0;
		let takenToday = 0;

		const medicineStats = medicines.map((med) => {
			let scheduledToday = 0;
			let takenTodayForMed = 0;

			for (const [slot, isScheduled] of Object.entries(med.timing.toObject())) {
				if (isScheduled) {
					scheduledToday += 1;
					if (med.taken && med.taken[slot]) {
						takenTodayForMed += 1;
					}
				}
			}

			totalTaken += med.takenCount || 0;
			totalMissed += med.missedCount || 0;
			totalScheduledToday += scheduledToday;
			takenToday += takenTodayForMed;

			return {
				id: med._id,
				name: med.medicineName,
				quantity: med.quantity,
				takenCount: med.takenCount || 0,
				missedCount: med.missedCount || 0,
				consecutiveMissedCount: med.consecutiveMissedCount || 0,
				emergencyContactNotified: med.emergencyContactNotified || false,
				scheduledToday,
				takenToday: takenTodayForMed,
				pendingToday: scheduledToday - takenTodayForMed,
			};
		});

		res.json({
			success: true,
			summary: {
				totalMedicines: medicines.length,
				totalTakenAllTime: totalTaken,
				totalMissedAllTime: totalMissed,
				scheduledToday: totalScheduledToday,
				takenToday: takenToday,
				pendingToday: totalScheduledToday - takenToday,
				adherenceRate: totalTaken + totalMissed > 0
					? Math.round((totalTaken / (totalTaken + totalMissed)) * 100)
					: 100,
			},
			medicines: medicineStats,
		});
	} catch (error) {
		console.error("Error fetching medicine stats:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * GET /api/medicines/schedule
 * Get full medicine schedule for today grouped by timing with taken status
 */
router.get("/schedule", authMiddleware, async (req, res) => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const medicines = await Medicine.find({
			patientId: req.userId,
			startDate: { $lte: today },
			endDate: { $gte: today },
		});

		// Group medicines by timing slot
		const schedule = {};

		for (const [slot, info] of Object.entries(TIMING_SCHEDULE)) {
			schedule[slot] = {
				label: info.label,
				hour: info.hour,
				minute: info.minute,
				medicines: [],
			};
		}

		for (const med of medicines) {
			for (const [slot, value] of Object.entries(med.timing.toObject())) {
				if (value && schedule[slot]) {
					schedule[slot].medicines.push({
						id: med._id,
						name: med.medicineName,
						quantity: med.quantity,
						taken: med.taken ? med.taken[slot] : false,
					});
				}
			}
		}

		res.json({
			success: true,
			date: today.toISOString().split("T")[0],
			schedule,
		});
	} catch (error) {
		console.error("Error fetching medicine schedule:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * PUT /api/medicines/:medicineId/take
 * Mark a medicine as taken for a specific timing slot
 */
router.put("/:medicineId/take", authMiddleware, async (req, res) => {
	try {
		const { medicineId } = req.params;
		const { timing } = req.body;

		if (!timing || !TIMING_SCHEDULE[timing]) {
			return res.status(400).json({
				message: "Invalid timing slot",
				validSlots: Object.keys(TIMING_SCHEDULE),
			});
		}

		const medicine = await Medicine.findOne({
			_id: medicineId,
			patientId: req.userId,
		});

		if (!medicine) {
			return res.status(404).json({ message: "Medicine not found" });
		}

		// Check if this timing is actually scheduled for this medicine
		if (!medicine.timing[timing]) {
			return res.status(400).json({
				message: `This medicine is not scheduled for ${timing}`,
			});
		}

		// Check if already taken for this slot
		if (medicine.taken[timing]) {
			return res.status(400).json({
				message: `${medicine.medicineName} already taken for ${TIMING_SCHEDULE[timing].label}`,
			});
		}

		// Check if quantity is available
		if (medicine.quantity <= 0) {
			return res.status(400).json({
				message: `No ${medicine.medicineName} tablets left. Please refill.`,
			});
		}

		// Mark as taken, decrease quantity, increase takenCount
		medicine.taken[timing] = true;
		medicine.quantity -= 1;
		medicine.takenCount += 1;
		
		// Reset consecutive missed count and emergency contact notification flag
		// since user is now taking their medicine again
		medicine.consecutiveMissedCount = 0;
		medicine.emergencyContactNotified = false;
		
		await medicine.save();

		// Also mark any pending reminder notification as read
		await Notification.updateMany(
			{
				medicineId: medicine._id,
				timing: timing,
				type: "medicine_reminder",
				isRead: false,
			},
			{ isRead: true }
		);

		res.json({
			success: true,
			message: `${medicine.medicineName} marked as taken for ${TIMING_SCHEDULE[timing].label}`,
			data: {
				medicineId: medicine._id,
				medicineName: medicine.medicineName,
				timing,
				taken: true,
				quantityLeft: medicine.quantity,
				takenCount: medicine.takenCount,
			},
		});
	} catch (error) {
		console.error("Error marking medicine as taken:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * PUT /api/medicines/:medicineId/untake
 * Undo marking a medicine as taken (in case of mistake)
 */
router.put("/:medicineId/untake", authMiddleware, async (req, res) => {
	try {
		const { medicineId } = req.params;
		const { timing } = req.body;

		if (!timing || !TIMING_SCHEDULE[timing]) {
			return res.status(400).json({
				message: "Invalid timing slot",
				validSlots: Object.keys(TIMING_SCHEDULE),
			});
		}

		const medicine = await Medicine.findOne({
			_id: medicineId,
			patientId: req.userId,
		});

		if (!medicine) {
			return res.status(404).json({ message: "Medicine not found" });
		}

		// Check if it was actually taken
		if (!medicine.taken[timing]) {
			return res.status(400).json({
				message: `${medicine.medicineName} was not marked as taken for ${TIMING_SCHEDULE[timing].label}`,
			});
		}

		// Mark as not taken, restore quantity, decrease takenCount
		medicine.taken[timing] = false;
		medicine.quantity += 1;
		if (medicine.takenCount > 0) {
			medicine.takenCount -= 1;
		}
		await medicine.save();

		res.json({
			success: true,
			message: `${medicine.medicineName} marked as not taken for ${TIMING_SCHEDULE[timing].label}`,
			data: {
				medicineId: medicine._id,
				medicineName: medicine.medicineName,
				timing,
				taken: false,
				quantityLeft: medicine.quantity,
				takenCount: medicine.takenCount,
			},
		});
	} catch (error) {
		console.error("Error unmarking medicine as taken:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * POST /api/medicines/trigger-reset
 * Manually trigger daily reset of taken status (for testing)
 */
router.post("/trigger-reset", authMiddleware, async (req, res) => {
	try {
		await resetDailyTakenStatus();

		res.json({
			success: true,
			message: "Daily taken status reset triggered",
		});
	} catch (error) {
		console.error("Error triggering reset:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * POST /api/medicines/trigger-reminder
 * Manually trigger reminder check for a specific timing slot (for testing)
 */
router.post("/trigger-reminder", authMiddleware, async (req, res) => {
	try {
		const { timing } = req.body;

		if (!timing || !TIMING_SCHEDULE[timing]) {
			return res.status(400).json({
				message: "Invalid timing slot",
				validSlots: Object.keys(TIMING_SCHEDULE),
			});
		}

		await checkMedicineReminders(timing);

		res.json({
			success: true,
			message: `Reminder check triggered for ${timing}`,
		});
	} catch (error) {
		console.error("Error triggering reminder:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * POST /api/medicines/trigger-missed-check
 * Manually trigger missed dose check (for testing)
 */
router.post("/trigger-missed-check", authMiddleware, async (req, res) => {
	try {
		await checkMissedDoses();

		res.json({
			success: true,
			message: "Missed dose check triggered",
		});
	} catch (error) {
		console.error("Error triggering missed check:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * POST /api/medicines/trigger-expiry-check
 * Manually trigger expiry check (for testing)
 */
router.post("/trigger-expiry-check", authMiddleware, async (req, res) => {
	try {
		await checkExpiredMedicines();

		res.json({
			success: true,
			message: "Expiry check triggered",
		});
	} catch (error) {
		console.error("Error triggering expiry check:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * POST /api/medicines/trigger-emergency-contact-check
 * Manually trigger emergency contact check for consecutive missed doses (for testing)
 */
router.post("/trigger-emergency-contact-check", authMiddleware, async (req, res) => {
	try {
		await checkConsecutiveMissedDoses();

		res.json({
			success: true,
			message: "Emergency contact check triggered",
			threshold: CONSECUTIVE_MISSED_THRESHOLD,
		});
	} catch (error) {
		console.error("Error triggering emergency contact check:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * GET /api/medicines/pending-notifications
 * Get all pending notifications ready to be sent (for notification service)
 */
router.get("/pending-notifications", async (req, res) => {
	try {
		const pending = await getPendingNotifications();

		res.json({
			success: true,
			count: pending.length,
			data: pending,
		});
	} catch (error) {
		console.error("Error fetching pending notifications:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * PUT /api/medicines/mark-sent/:notificationId
 * Mark a notification as sent (for notification service)
 */
router.put("/mark-sent/:notificationId", async (req, res) => {
	try {
		await markNotificationAsSent(req.params.notificationId);

		res.json({
			success: true,
			message: "Notification marked as sent",
		});
	} catch (error) {
		console.error("Error marking notification as sent:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * POST /api/medicines/test-taken-logic
 * Test the taken logic: creates a reminder notification for a medicine,
 * then you can mark it taken and see if SMS is skipped.
 * Body: { medicineId, timing }
 */
router.post("/test-taken-logic", authMiddleware, async (req, res) => {
	try {
		const { medicineId, timing } = req.body;

		if (!timing || !TIMING_SCHEDULE[timing]) {
			return res.status(400).json({
				message: "Invalid timing slot",
				validSlots: Object.keys(TIMING_SCHEDULE),
			});
		}

		const medicine = await Medicine.findOne({
			_id: medicineId,
			patientId: req.userId,
		}).populate("patientId", "name email phone");

		if (!medicine) {
			return res.status(404).json({ message: "Medicine not found" });
		}

		// Check current taken status
		const isTaken = medicine.taken && medicine.taken[timing];

		// Create a test notification (isSent: false so worker picks it up)
		const Notification = require("../models/Notification");
		const notification = new Notification({
			userId: medicine.patientId._id,
			medicineId: medicine._id,
			type: "medicine_reminder",
			title: "Test Reminder",
			message: `[TEST] Time to take ${medicine.medicineName} - ${TIMING_SCHEDULE[timing].label}`,
			timing: timing,
			scheduledFor: new Date(),
			isSent: false,
		});
		await notification.save();

		res.json({
			success: true,
			message: `Test notification created. Medicine taken[${timing}] = ${isTaken}. Worker will ${isTaken ? 'SKIP' : 'SEND'} SMS.`,
			data: {
				notificationId: notification._id,
				medicineId: medicine._id,
				medicineName: medicine.medicineName,
				timing,
				takenStatus: isTaken,
				expectedBehavior: isTaken ? "SMS will be SKIPPED" : "SMS will be SENT",
			},
		});
	} catch (error) {
		console.error("Error in test-taken-logic:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

module.exports = router;
