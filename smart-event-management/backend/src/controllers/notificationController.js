const notificationService = require("../services/notificationService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");

/**
 * GET /api/notifications
 * Get current user notifications.
 */
const getMyNotifications = asyncHandler(async (req, res) => {
    const { limit, skip } = req.query;
    const notifications = await notificationService.getUserNotifications(
        req.user.userId,
        parseInt(limit) || 50,
        parseInt(skip) || 0
    );
    const unreadCount = await notificationService.getUnreadCount(req.user.userId);
    
    return sendResponse(res, 200, "Notifications fetched", {
        notifications,
        unreadCount
    });
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
const markRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user.userId);
    return sendResponse(res, 200, "Notification marked as read", notification);
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read.
 */
const markAllRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user.userId);
    return sendResponse(res, 200, "All notifications marked as read");
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification.
 */
const removeNotification = asyncHandler(async (req, res) => {
    await notificationService.deleteNotification(req.params.id, req.user.userId);
    return sendResponse(res, 200, "Notification deleted");
});

/**
 * POST /api/notifications/broadcast
 * Send a broadcast notification to event registrants.
 */
const sendBroadcast = asyncHandler(async (req, res) => {
    const { eventId, targetAudience, title, body, priority } = req.body;
    
    if (!eventId || !title || !body) {
        const err = new Error("Event ID, title, and body are required");
        err.statusCode = 400;
        throw err;
    }

    const count = await notificationService.sendBroadcast({
        organizerId: req.user.userId,
        eventId,
        targetAudience: targetAudience || "all",
        title,
        body,
        priority: priority || "normal"
    });

    return sendResponse(res, 201, `Broadcast sent to ${count} recipients`, { count });
});

/**
 * GET /api/notifications/broadcasts
 * Get sent broadcasts history for organizer.
 */
const getBroadcastHistory = asyncHandler(async (req, res) => {
    const broadcasts = await notificationService.getBroadcastHistory(req.user.userId);
    return sendResponse(res, 200, "Broadcast history fetched", broadcasts);
});

module.exports = {
    getMyNotifications,
    markRead,
    markAllRead,
    removeNotification,
    sendBroadcast,
    getBroadcastHistory
};
