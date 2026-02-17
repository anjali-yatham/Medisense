const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const MedDatabase = require("../models/MedDatabase");

// Auth middleware
const authMiddleware = async (req, res, next) => {
	try {
		const token = req.header("Authorization")?.replace("Bearer ", "");
		if (!token) {
			return res.status(401).json({ message: "No token provided" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.userId || decoded.id;
		req.userRole = decoded.role;
		next();
	} catch (error) {
		res.status(401).json({ message: "Invalid token" });
	}
};

// Admin middleware (only super admin can add/edit/delete)
const adminMiddleware = (req, res, next) => {
	if (req.userRole !== "superadmin") {
		return res.status(403).json({ message: "Access denied. Admin only." });
	}
	next();
};

/**
 * GET /api/med-database
 * Get all medicines from database with optional search and filters
 * Public route - no authentication required
 */
router.get("/", async (req, res) => {
	try {
		const { search, category, prescriptionRequired, manufacturer } = req.query;

		let query = {};

		// Search by medicine name
		if (search) {
			query.medicineName = { $regex: search, $options: "i" };
		}

		// Filter by category
		if (category) {
			query.category = category;
		}

		// Filter by prescription requirement
		if (prescriptionRequired !== undefined) {
			query.prescriptionRequired = prescriptionRequired === "true";
		}

		// Filter by manufacturer
		if (manufacturer) {
			query.manufacturer = { $regex: manufacturer, $options: "i" };
		}

		const medicines = await MedDatabase.find(query)
			.sort({ medicineName: 1 })
			.populate("addedBy", "name email");

		res.json({
			success: true,
			count: medicines.length,
			medicines,
		});
	} catch (error) {
		console.error("Error fetching medicine database:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * GET /api/med-database/:id
 * Get single medicine details by ID
 * Public route - no authentication required
 */
router.get("/:id", async (req, res) => {
	try {
		const medicine = await MedDatabase.findById(req.params.id).populate(
			"addedBy",
			"name email"
		);

		if (!medicine) {
			return res.status(404).json({ message: "Medicine not found" });
		}

		res.json({
			success: true,
			medicine,
		});
	} catch (error) {
		console.error("Error fetching medicine:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * POST /api/med-database
 * Add a new medicine to database (Admin only)
 */
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
	try {
		const {
			medicineName,
			composition,
			purpose,
			category,
			dosageAdults,
			dosageChildren,
			sideEffectsCommon,
			sideEffectsRare,
			contraindications,
			prescriptionRequired,
			manufacturer,
			imageUrl,
		} = req.body;

		// Check if medicine already exists
		const existingMedicine = await MedDatabase.findOne({ medicineName });
		if (existingMedicine) {
			return res.status(400).json({
				message: "Medicine with this name already exists in database",
			});
		}

		const medicine = new MedDatabase({
			medicineName,
			composition,
			purpose,
			category,
			dosageAdults,
			dosageChildren,
			sideEffectsCommon,
			sideEffectsRare,
			contraindications,
			prescriptionRequired,
			manufacturer,
			imageUrl,
			addedBy: req.userId,
		});

		await medicine.save();

		res.status(201).json({
			success: true,
			message: "Medicine added to database successfully",
			medicine,
		});
	} catch (error) {
		console.error("Error adding medicine:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * PUT /api/med-database/:id
 * Update medicine details (Admin only)
 */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
	try {
		const medicine = await MedDatabase.findById(req.params.id);

		if (!medicine) {
			return res.status(404).json({ message: "Medicine not found" });
		}

		const {
			medicineName,
			composition,
			purpose,
			category,
			dosageAdults,
			dosageChildren,
			sideEffectsCommon,
			sideEffectsRare,
			contraindications,
			prescriptionRequired,
			manufacturer,
			imageUrl,
		} = req.body;

		// Check if new name conflicts with existing medicine
		if (medicineName && medicineName !== medicine.medicineName) {
			const existingMedicine = await MedDatabase.findOne({ medicineName });
			if (existingMedicine) {
				return res.status(400).json({
					message: "Medicine with this name already exists in database",
				});
			}
		}

		// Update fields
		if (medicineName) medicine.medicineName = medicineName;
		if (composition) medicine.composition = composition;
		if (purpose) medicine.purpose = purpose;
		if (category) medicine.category = category;
		if (dosageAdults !== undefined) medicine.dosageAdults = dosageAdults;
		if (dosageChildren !== undefined) medicine.dosageChildren = dosageChildren;
		if (sideEffectsCommon !== undefined)
			medicine.sideEffectsCommon = sideEffectsCommon;
		if (sideEffectsRare !== undefined) medicine.sideEffectsRare = sideEffectsRare;
		if (contraindications !== undefined)
			medicine.contraindications = contraindications;
		if (prescriptionRequired !== undefined)
			medicine.prescriptionRequired = prescriptionRequired;
		if (manufacturer) medicine.manufacturer = manufacturer;
		if (imageUrl !== undefined) medicine.imageUrl = imageUrl;

		await medicine.save();

		res.json({
			success: true,
			message: "Medicine updated successfully",
			medicine,
		});
	} catch (error) {
		console.error("Error updating medicine:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * DELETE /api/med-database/:id
 * Delete medicine from database (Admin only)
 */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
	try {
		const medicine = await MedDatabase.findById(req.params.id);

		if (!medicine) {
			return res.status(404).json({ message: "Medicine not found" });
		}

		await MedDatabase.findByIdAndDelete(req.params.id);

		res.json({
			success: true,
			message: "Medicine deleted from database successfully",
		});
	} catch (error) {
		console.error("Error deleting medicine:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * GET /api/med-database/categories/list
 * Get list of all categories
 * Public route - no authentication required
 */
router.get("/categories/list", async (req, res) => {
	try {
		const categories = await MedDatabase.distinct("category");

		res.json({
			success: true,
			categories,
		});
	} catch (error) {
		console.error("Error fetching categories:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * GET /api/med-database/manufacturers/list
 * Get list of all manufacturers
 * Public route - no authentication required
 */
router.get("/manufacturers/list", async (req, res) => {
	try {
		const manufacturers = await MedDatabase.distinct("manufacturer");

		res.json({
			success: true,
			manufacturers,
		});
	} catch (error) {
		console.error("Error fetching manufacturers:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

module.exports = router;
