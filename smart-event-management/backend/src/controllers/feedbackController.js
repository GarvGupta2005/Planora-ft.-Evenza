const feedbackService = require("../services/feedbackService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");

/**
 * POST /api/feedback/:eventId
 * Submit feedback for an event.
 * Body: { rating, comments, metrics: { venue, content, organization } }
 */
const submitFeedback = asyncHandler(async (req, res) => {
    const feedback = await feedbackService.submitFeedback(
        req.user.userId,
        req.params.eventId,
        req.body
    );
    return sendResponse(res, 201, "Feedback submitted successfully", feedback);
});

/**
 * GET /api/feedback/:eventId
 * Get all feedback for an event, with aggregate stats.
 */
const getEventFeedback = asyncHandler(async (req, res) => {
    const [feedback, stats] = await Promise.all([
        feedbackService.getEventFeedback(req.params.eventId),
        feedbackService.getFeedbackStats(req.params.eventId)
    ]);
    return sendResponse(res, 200, "Feedback fetched successfully", { feedback, stats });
});

/**
 * GET /api/feedback/:eventId/stats
 * Get only the aggregate stats for quick dashboard display.
 */
const getFeedbackStats = asyncHandler(async (req, res) => {
    const stats = await feedbackService.getFeedbackStats(req.params.eventId);
    return sendResponse(res, 200, "Feedback stats fetched", stats);
});

/**
 * GET /api/feedback/:eventId/trends
 * Rating trend over time (for chart).
 */
const getFeedbackTrends = asyncHandler(async (req, res) => {
    const trends = await feedbackService.getFeedbackTrends(req.params.eventId);
    return sendResponse(res, 200, "Feedback trends fetched", trends);
});

/**
 * DELETE /api/feedback/:feedbackId
 * Delete a feedback entry (only the author or an admin can delete).
 */
const deleteFeedback = asyncHandler(async (req, res) => {
    await feedbackService.deleteFeedback(req.params.feedbackId, req.user.userId, req.user.roles);
    return sendResponse(res, 200, "Feedback deleted successfully");
});

/**
 * GET /api/feedback/my
 * Get all feedback entries submitted by the current user.
 */
const getMyFeedback = asyncHandler(async (req, res) => {
    const feedback = await feedbackService.getUserFeedback(req.user.userId);
    return sendResponse(res, 200, "My feedback fetched successfully", feedback);
});

/**
 * GET /api/feedback/organizer
 * Get all feedback entries across all events owned by the authenticated organizer.
 */
const getOrganizerFeedback = asyncHandler(async (req, res) => {
    const feedback = await feedbackService.getOrganizerFeedback(req.user.userId);
    return sendResponse(res, 200, "Organizer feedback fetched successfully", feedback);
});

module.exports = {
    submitFeedback,
    getEventFeedback,
    getFeedbackStats,
    getFeedbackTrends,
    deleteFeedback,
    getMyFeedback,
    getOrganizerFeedback
};
