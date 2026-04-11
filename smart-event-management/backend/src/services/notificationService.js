const Notification = require("../models/Notification");
const Registration = require("../models/Registration");
const Broadcast = require("../models/Broadcast");

/**
 * Create a new notification for a user.
 */
const createNotification = async (recipientId, data) => {
    const notification = await Notification.create({
        recipient: recipientId,
        type: data.type || "general",
        title: data.title,
        body: data.body,
        priority: data.priority || "normal",
        refModel: data.refModel || null,
        refId: data.refId || null
    });
    return notification;
};

/**
 * Send a broadcast notification to multiple users based on event and role.
 */
const sendBroadcast = async ({ organizerId, eventId, targetAudience, title, body, priority }) => {
    // Determine target roles
    let roles = ["participant", "volunteer"];
    if (targetAudience === "participants") roles = ["participant"];
    if (targetAudience === "volunteers") roles = ["volunteer"];

    // Find all users registered for this event with matching roles
    const registrations = await Registration.find({
        event: eventId,
        role: { $in: roles }
    }).select("user");

    const userIds = [...new Set(registrations.map(r => r.user.toString()))];

    // Even if 0 recipients, we might want to log the broadcast attempt,
    // but usually, it's better to only save if count > 0.
    
    // Create notifications in bulk
    if (userIds.length > 0) {
        const notifications = userIds.map(uid => ({
            recipient: uid,
            type: "broadcast",
            title,
            body,
            priority: priority || "normal",
            refModel: "Event",
            refId: eventId
        }));
        await Notification.insertMany(notifications);
    }

    // Save broadcast record for history
    await Broadcast.create({
        organizer: organizerId,
        event: eventId,
        title,
        body,
        targetAudience,
        priority: priority || "normal",
        recipientCount: userIds.length
    });

    return userIds.length;
};

/**
 * Get broadcast history for an organizer.
 */
const getBroadcastHistory = async (organizerId) => {
    return Broadcast.find({ organizer: organizerId })
        .populate("event", "title")
        .sort({ createdAt: -1 });
};

/**
 * Get all notifications for a user, sorted by newest first.
 */
const getUserNotifications = async (userId, limit = 50, skip = 0) => {
    return Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

/**
 * Get unread count for a user.
 */
const getUnreadCount = async (userId) => {
    return Notification.countDocuments({ recipient: userId, isRead: false });
};

/**
 * Mark a notification as read.
 */
const markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true },
        { new: true }
    );
    if (!notification) {
        const err = new Error("Notification not found");
        err.statusCode = 404;
        throw err;
    }
    return notification;
};

/**
 * Mark all notifications as read for a user.
 */
const markAllAsRead = async (userId) => {
    return Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

/**
 * Delete a notification.
 */
const deleteNotification = async (notificationId, userId) => {
    const notification = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
    if (!notification) {
        const err = new Error("Notification not found");
        err.statusCode = 404;
        throw err;
    }
    return true;
};

module.exports = {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendBroadcast,
    getBroadcastHistory
};
