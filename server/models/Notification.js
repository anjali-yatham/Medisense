const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
		},
		medicineId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Medicine",
			required: false,
		},
		type: {
			type: String,
			enum: [
				"medicine_reminder",
				"missed_dose",
				"medicine_expired",
				"medicine_expiring_soon",
				"new_medicine_added",
				"emergency_contact_alert",
			],
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		timing: {
			type: String,
			enum: [
				"beforeBreakfast",
				"afterBreakfast",
				"beforeLunch",
				"afterLunch",
				"beforeDinner",
				"afterDinner",
				null,
			],
			default: null,
		},
		scheduledFor: {
			type: Date,
			required: true,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
		isSent: {
			type: Boolean,
			default: false,
		},
		// For emergency contact notifications
		isEmergencyContactNotification: {
			type: Boolean,
			default: false,
		},
		emergencyContactPhone: {
			type: String,
			default: null,
		},
		emergencyContactName: {
			type: String,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes for faster queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, scheduledFor: 1 });
notificationSchema.index({ isSent: 1, scheduledFor: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
