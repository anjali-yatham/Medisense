const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Medicine = require("../models/Medicine");
const Prescription = require("../models/Prescription");
const User = require("../models/User");
const { createNewMedicineNotification } = require("../services/cronService");

const router = express.Router();

const JWT_SECRET =
	process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ message: "Access token required" });
	}

	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).json({ message: "Invalid or expired token" });
		}
		req.user = decoded;
		next();
	});
};

// Middleware to check if user is organisation type
const isOrganisation = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.userId);
		if (!user || user.userType !== "organisation") {
			return res
				.status(403)
				.json({
					message:
						"Access denied. Only organisations can create prescriptions.",
				});
		}
		next();
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error checking user type", error: error.message });
	}
};

// Create prescription (multiple medicines)
router.post("/create", authenticateToken, isOrganisation, async (req, res) => {
	try {
		const { patientId, medicines } = req.body;

		// Validate patientId
		if (!mongoose.Types.ObjectId.isValid(patientId)) {
			return res.status(400).json({ message: "Invalid patient ID format" });
		}

		// Check if patient exists
		const patient = await User.findById(patientId);
		if (!patient) {
			return res.status(404).json({ message: "Patient not found" });
		}

		// Validate medicines array
		if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
			return res
				.status(400)
				.json({ message: "At least one medicine is required" });
		}

		// Step 1: Create the Prescription document first
		const prescription = new Prescription({
			patientId,
			prescribedBy: req.user.userId,
			medicines: [] // Will be populated after creating medicine docs
		});
		await prescription.save();

		// Step 2: Create individual Medicine documents with reference to the prescription
		const medicineDocuments = medicines.map((med) => ({
			patientId,
			prescribedBy: req.user.userId,
			medicineName: med.name,
			quantity: med.quantity,
			startDate: new Date(med.startDate),
			endDate: new Date(med.endDate),
			timing: {
				beforeBreakfast: med.timing.beforeBreakfast || false,
				afterBreakfast: med.timing.afterBreakfast || false,
				beforeLunch: med.timing.beforeLunch || false,
				afterLunch: med.timing.afterLunch || false,
				beforeDinner: med.timing.beforeDinner || false,
				afterDinner: med.timing.afterDinner || false,
			},
			prescriptionId: prescription._id
		}));

		// Insert all medicines
		const createdMedicines = await Medicine.insertMany(medicineDocuments);

		// Step 3: Update the Prescription document with medicine IDs
		prescription.medicines = createdMedicines.map(med => med._id);
		await prescription.save();

		// Create notifications for each new medicine
		for (const medicine of createdMedicines) {
			try {
				await createNewMedicineNotification(medicine, patientId);
			} catch (notifError) {
				console.error("Error creating notification for medicine:", notifError);
				// Don't fail the whole request if notification creation fails
			}
		}

		res.status(201).json({
			message: "Prescription created successfully",
			prescriptionId: prescription._id,
			medicines: createdMedicines,
		});
	} catch (error) {
		console.error("Create prescription error:", error);
		res
			.status(500)
			.json({ message: "Error creating prescription", error: error.message });
	}
});

// Get all prescriptions created by organisation
router.get(
	"/my-prescriptions",
	authenticateToken,
	isOrganisation,
	async (req, res) => {
		try {
			const prescriptions = await Prescription.find({ prescribedBy: req.user.userId })
				.populate("patientId", "name email phone")
				.populate("medicines")
				.sort({ createdAt: -1 });

			res.status(200).json({
				prescriptions: prescriptions,
			});
		} catch (error) {
			console.error("Get prescriptions error:", error);
			res
				.status(500)
				.json({
					message: "Error fetching prescriptions",
					error: error.message,
				});
		}
	}
);

// Get prescriptions for a patient (accessible by the patient themselves)
router.get("/patient-prescriptions", authenticateToken, async (req, res) => {
	try {
		const prescriptions = await Prescription.find({ patientId: req.user.userId })
			.populate({
				path: "medicines",
				options: { sort: { createdAt: -1, _id: -1 } }
			})
			.populate("prescribedBy", "name email")
			.sort({ createdAt: -1, _id: -1 });

		res.status(200).json({
			prescriptions: prescriptions,
		});
	} catch (error) {
		console.error("Get patient prescriptions error:", error);
		res
			.status(500)
			.json({ message: "Error fetching prescriptions", error: error.message });
	}
});

// Search patients by name or email (for organisations to find patients)
router.get(
	"/search-patients",
	authenticateToken,
	isOrganisation,
	async (req, res) => {
		try {
			const { query } = req.query;

			if (!query || query.length < 2) {
				return res
					.status(400)
					.json({ message: "Search query must be at least 2 characters" });
			}

			const patients = await User.find({
				userType: "user",
				$or: [
					{ name: { $regex: query, $options: "i" } },
					{ email: { $regex: query, $options: "i" } },
				],
			})
				.select("_id name email phone")
				.limit(10);

			res.status(200).json({ patients });
		} catch (error) {
			console.error("Search patients error:", error);
			res
				.status(500)
				.json({ message: "Error searching patients", error: error.message });
		}
	}
);

// Get prescriptions for a specific patient (for organisations)
router.get(
	"/patient/:patientId",
	authenticateToken,
	isOrganisation,
	async (req, res) => {
		try {
			const { patientId } = req.params;

			if (!mongoose.Types.ObjectId.isValid(patientId)) {
				return res.status(400).json({ message: "Invalid patient ID" });
			}

			const prescriptions = await Prescription.find({ 
				patientId,
				prescribedBy: req.user.userId 
			})
				.populate("prescribedBy", "name email")
				.populate("medicines")
				.sort({ createdAt: -1, _id: -1 });

			res.status(200).json({
				prescriptions: prescriptions,
			});
		} catch (error) {
			console.error("Get patient prescriptions error:", error);
			res
				.status(500)
				.json({ message: "Error fetching prescriptions", error: error.message });
		}
	}
);

module.exports = router;