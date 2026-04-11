const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { ROLES } = require("../config/constants");

// All routes require authentication
router.use(authMiddleware);

// GET /api/notifications — get all notifications for user
router.get("/", notificationController.getMyNotifications);

// POST /api/notifications/broadcast — send a broadcast (Organizers only)
router.post(
    "/broadcast",
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    notificationController.sendBroadcast
);

// GET /api/notifications/broadcasts — history for organizers
router.get(
    "/broadcasts",
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    notificationController.getBroadcastHistory
);

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", notificationController.markAllRead);

// PATCH /api/notifications/:id/read — mark specific as read
router.patch("/:id/read", notificationController.markRead);

// DELETE /api/notifications/:id — delete a notification
router.delete("/:id", notificationController.removeNotification);

module.exports = router;
