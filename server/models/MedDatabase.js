const mongoose = require("mongoose");

const medDatabaseSchema = new mongoose.Schema(
	{
		medicineName: {
			type: String,
			required: [true, "Medicine name is required"],
			trim: true,
			unique: true,
		},
		composition: {
			type: String,
			required: [true, "Composition is required"],
			trim: true,
		},
		purpose: {
			type: String,
			required: [true, "Purpose/When to use is required"],
			trim: true,
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			enum: [
				"Painkiller",
				"Antibiotic",
				"Antacid",
				"Anti-Allergic",
				"Antipyretic",
				"Anti-Inflammatory",
				"Vitamin/Supplement",
				"Antidiabetic",
				"Antihypertensive",
				"Antihistamine",
				"Cough & Cold",
				"Gastrointestinal",
				"Cardiovascular",
				"Respiratory",
				"Other",
			],
		},
		dosageAdults: {
			type: String,
			default: "",
			trim: true,
		},
		dosageChildren: {
			type: String,
			default: "",
			trim: true,
		},
		sideEffectsCommon: {
			type: String,
			default: "",
			trim: true,
		},
		sideEffectsRare: {
			type: String,
			default: "",
			trim: true,
		},
		contraindications: {
			type: String,
			default: "",
			trim: true,
		},
		prescriptionRequired: {
			type: Boolean,
			required: true,
			default: false,
		},
		manufacturer: {
			type: String,
			required: [true, "Manufacturer name is required"],
			trim: true,
		},
		imageUrl: {
			type: String,
			default: "",
			trim: true,
		},
		addedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster searches
medDatabaseSchema.index({ medicineName: 1 });
medDatabaseSchema.index({ category: 1 });
medDatabaseSchema.index({ manufacturer: 1 });

module.exports = mongoose.model("MedDatabase", medDatabaseSchema);
