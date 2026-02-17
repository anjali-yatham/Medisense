const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

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
 * GET /api/notifications
 * Get all notifications for the logged-in user
 */
router.get("/", authMiddleware, async (req, res) => {
	try {
		const { type, isRead, limit = 50, page = 1 } = req.query;

		const query = { userId: req.userId };

		if (type) {
			query.type = type;
		}

		if (isRead !== undefined) {
			query.isRead = isRead === "true";
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const notifications = await Notification.find(query)
			.populate("medicineId", "medicineName")
			.sort({ scheduledFor: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Notification.countDocuments(query);

		res.json({
			success: true,
			data: notifications,
			pagination: {
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				pages: Math.ceil(total / parseInt(limit)),
			},
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get("/unread-count", authMiddleware, async (req, res) => {
	try {
		const count = await Notification.countDocuments({
			userId: req.userId,
			isRead: false,
		});

		res.json({
			success: true,
			count,
		});
	} catch (error) {
		console.error("Error fetching unread count:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * GET /api/notifications/today
 * Get today's notifications (reminders, missed doses)
 */
router.get("/today", authMiddleware, async (req, res) => {
	try {
		const todayStart = new Date();
		todayStart.setHours(0, 0, 0, 0);

		const todayEnd = new Date();
		todayEnd.setHours(23, 59, 59, 999);

		const notifications = await Notification.find({
			userId: req.userId,
			scheduledFor: {
				$gte: todayStart,
				$lte: todayEnd,
			},
		})
			.populate("medicineId", "medicineName")
			.sort({ scheduledFor: -1 });

		res.json({
			success: true,
			data: notifications,
		});
	} catch (error) {
		console.error("Error fetching today's notifications:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * GET /api/notifications/pending
 * Get pending notifications (for the notification service)
 */
router.get("/pending", authMiddleware, async (req, res) => {
	try {
		const notifications = await Notification.find({
			userId: req.userId,
			isSent: false,
			scheduledFor: { $lte: new Date() },
		})
			.populate("medicineId", "medicineName")
			.sort({ scheduledFor: 1 });

		res.json({
			success: true,
			data: notifications,
		});
	} catch (error) {
		console.error("Error fetching pending notifications:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read (acknowledges the dose was taken)
 */
router.put("/:id/read", authMiddleware, async (req, res) => {
	try {
		const notification = await Notification.findOneAndUpdate(
			{ _id: req.params.id, userId: req.userId },
			{ isRead: true },
			{ new: true }
		);

		if (!notification) {
			return res.status(404).json({ message: "Notification not found" });
		}

		res.json({
			success: true,
			data: notification,
		});
	} catch (error) {
		console.error("Error marking notification as read:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * PUT /api/notifications/:id/sent
 * Mark a notification as sent (for the notification service)
 */
router.put("/:id/sent", authMiddleware, async (req, res) => {
	try {
		const notification = await Notification.findOneAndUpdate(
			{ _id: req.params.id, userId: req.userId },
			{ isSent: true },
			{ new: true }
		);

		if (!notification) {
			return res.status(404).json({ message: "Notification not found" });
		}

		res.json({
			success: true,
			data: notification,
		});
	} catch (error) {
		console.error("Error marking notification as sent:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the user
 */
router.put("/read-all", authMiddleware, async (req, res) => {
	try {
		await Notification.updateMany(
			{ userId: req.userId, isRead: false },
			{ isRead: true }
		);

		res.json({
			success: true,
			message: "All notifications marked as read",
		});
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete("/:id", authMiddleware, async (req, res) => {
	try {
		const notification = await Notification.findOneAndDelete({
			_id: req.params.id,
			userId: req.userId,
		});

		if (!notification) {
			return res.status(404).json({ message: "Notification not found" });
		}

		res.json({
			success: true,
			message: "Notification deleted",
		});
	} catch (error) {
		console.error("Error deleting notification:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

module.exports = router;
