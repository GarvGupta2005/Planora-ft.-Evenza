const dashboardService = require("../services/dashboardService");
const aiService = require("../services/aiService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");

/**
 * GET /api/dashboard/stats
 * Platform-wide overview stats (Admin).
 */
const getOverallStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getOverallStats();
    return sendResponse(res, 200, "Overall stats fetched", stats);
});

/**
 * GET /api/dashboard/organizer
 * Organizer-scoped stats — only events owned by the authenticated organizer.
 */
const getOrganizerStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getOrganizerStats(req.user.userId);
    return sendResponse(res, 200, "Organizer stats fetched", stats);
});

/**
 * GET /api/dashboard/events/:eventId/summary
 * Per-event summary: registrations, attendance, feedback, volunteers.
 */
const getEventSummary = asyncHandler(async (req, res) => {
    const summary = await dashboardService.getEventSummary(req.params.eventId);
    
    // Generate AI suggestions based on the summary data
    const suggestions = aiService.getEventSuggestions(summary);
    
    return sendResponse(res, 200, "Event summary fetched", {
        stats: summary,
        aiSuggestions: suggestions
    });
});

/**
 * GET /api/dashboard/charts/registrations?months=6
 * Monthly registration chart data.
 */
const getMonthlyRegistrations = asyncHandler(async (req, res) => {
    const months = parseInt(req.query.months) || 6;
    const data = await dashboardService.getMonthlyRegistrations(months);
    return sendResponse(res, 200, "Monthly registration data fetched", data);
});

/**
 * GET /api/dashboard/charts/events?months=6
 * Monthly events-created chart data.
 */
const getMonthlyEvents = asyncHandler(async (req, res) => {
    const months = parseInt(req.query.months) || 6;
    const data = await dashboardService.getMonthlyEvents(months);
    return sendResponse(res, 200, "Monthly events data fetched", data);
});

module.exports = {
    getOverallStats,
    getOrganizerStats,
    getEventSummary,
    getMonthlyRegistrations,
    getMonthlyEvents
};
