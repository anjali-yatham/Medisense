const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
	{
		patientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Patient ID is required"],
		},
		prescribedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Prescriber ID is required"],
		},
		prescriptionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Prescription",
			required: [true, "Prescription ID is required"],
		},
		medicineName: {
			type: String,
			required: [true, "Medicine name is required"],
			trim: true,
		},
		quantity: {
			type: Number,
			required: [true, "Quantity is required"],
			min: 0,
		},
		startDate: {
			type: Date,
			required: [true, "Start date is required"],
		},
		endDate: {
			type: Date,
			required: [true, "End date is required"],
		},
		timing: {
			beforeBreakfast: {
				type: Boolean,
				default: false,
			},
			afterBreakfast: {
				type: Boolean,
				default: false,
			},
			beforeLunch: {
				type: Boolean,
				default: false,
			},
			afterLunch: {
				type: Boolean,
				default: false,
			},
			beforeDinner: {
				type: Boolean,
				default: false,
			},
			afterDinner: {
				type: Boolean,
				default: false,
			},
		},
		// Track if medicine is taken for each timing slot (resets daily at midnight)
		taken: {
			beforeBreakfast: {
				type: Boolean,
				default: false,
			},
			afterBreakfast: {
				type: Boolean,
				default: false,
			},
			beforeLunch: {
				type: Boolean,
				default: false,
			},
			afterLunch: {
				type: Boolean,
				default: false,
			},
			beforeDinner: {
				type: Boolean,
				default: false,
			},
			afterDinner: {
				type: Boolean,
				default: false,
			},
		},
		// Last date when taken status was reset
		lastResetDate: {
			type: Date,
			default: null,
		},
		// Total count of doses taken
		takenCount: {
			type: Number,
			default: 0,
		},
		// Total count of doses missed
		missedCount: {
			type: Number,
			default: 0,
		},
		// Consecutive missed doses counter (resets when user takes medicine)
		consecutiveMissedCount: {
			type: Number,
			default: 0,
		},
		// Track if emergency contact has been notified for current consecutive misses
		emergencyContactNotified: {
			type: Boolean,
			default: false,
		},
		// Last time emergency contact was notified
		lastEmergencyNotificationDate: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
medicineSchema.index({ patientId: 1 });
medicineSchema.index({ prescribedBy: 1 });
medicineSchema.index({ prescriptionId: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);