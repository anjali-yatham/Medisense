const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
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
		medicines: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Medicine",
		}],
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ prescribedBy: 1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
