const messageService = require("../services/messageService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");

/**
 * POST /api/messages/:eventId
 * Send a message in the event's chat channel.
 * Body: { content }
 */
const sendMessage = asyncHandler(async (req, res) => {
    const message = await messageService.sendMessage(
        req.user.userId,
        req.params.eventId,
        req.body.content
    );
    return sendResponse(res, 201, "Message sent", message);
});

/**
 * GET /api/messages/:eventId
 * Get all messages for an event (paginated).
 * Query: ?limit=100&skip=0
 */
const getEventMessages = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;
    const messages = await messageService.getEventMessages(req.params.eventId, limit, skip);
    return sendResponse(res, 200, "Messages fetched", messages);
});

/**
 * DELETE /api/messages/:messageId
 * Delete a message — sender or organizer only.
 */
const deleteMessage = asyncHandler(async (req, res) => {
    await messageService.deleteMessage(req.params.messageId, req.user.userId, req.user.roles);
    return sendResponse(res, 200, "Message deleted");
});

/**
 * PATCH /api/messages/:messageId/pin
 * Toggle pin state of a message (organizer only).
 */
const togglePin = asyncHandler(async (req, res) => {
    const message = await messageService.togglePin(req.params.messageId);
    return sendResponse(res, 200, "Message pin state updated", message);
});

/**
 * GET /api/messages/:eventId/pinned
 * Get all pinned messages for an event.
 */
const getPinnedMessages = asyncHandler(async (req, res) => {
    const messages = await messageService.getPinnedMessages(req.params.eventId);
    return sendResponse(res, 200, "Pinned messages fetched", messages);
});

module.exports = {
    sendMessage,
    getEventMessages,
    deleteMessage,
    togglePin,
    getPinnedMessages
};
