const Message = require("../models/Message");
const Event = require("../models/Event");

/**
 * Send a message in an event's chat channel.
 */
const sendMessage = async (senderId, eventId, content) => {
    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
        const err = new Error("Event not found");
        err.statusCode = 404;
        throw err;
    }

    if (!content || !content.trim()) {
        const err = new Error("Message content cannot be empty");
        err.statusCode = 400;
        throw err;
    }

    const message = await Message.create({
        event: eventId,
        sender: senderId,
        content: content.trim()
    });

    return message.populate("sender", "fullName roles");
};

/**
 * Get all messages for an event, oldest-first (chat feed).
 */
const getEventMessages = async (eventId, limit = 100, skip = 0) => {
    const event = await Event.findById(eventId);
    if (!event) {
        const err = new Error("Event not found");
        err.statusCode = 404;
        throw err;
    }

    return Message.find({ event: eventId })
        .populate("sender", "fullName roles")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);
};

/**
 * Delete a message — only the sender or an organizer can delete.
 */
const deleteMessage = async (messageId, requestingUserId, userRoles) => {
    const message = await Message.findById(messageId);
    if (!message) {
        const err = new Error("Message not found");
        err.statusCode = 404;
        throw err;
    }

    const isOwner = message.sender.toString() === requestingUserId.toString();
    const isOrganizer = Array.isArray(userRoles) && userRoles.includes("Organizer");

    if (!isOwner && !isOrganizer) {
        const err = new Error("Forbidden: you cannot delete this message");
        err.statusCode = 403;
        throw err;
    }

    await message.deleteOne();
    return true;
};

/**
 * Pin / unpin a message (organizer only).
 */
const togglePin = async (messageId) => {
    const message = await Message.findById(messageId);
    if (!message) {
        const err = new Error("Message not found");
        err.statusCode = 404;
        throw err;
    }

    message.isPinned = !message.isPinned;
    await message.save();
    return message.populate("sender", "fullName roles");
};

/**
 * Get all pinned messages for an event.
 */
const getPinnedMessages = async (eventId) => {
    return Message.find({ event: eventId, isPinned: true })
        .populate("sender", "fullName roles")
        .sort({ createdAt: -1 });
};

module.exports = {
    sendMessage,
    getEventMessages,
    deleteMessage,
    togglePin,
    getPinnedMessages
};
