const codeService = require("../services/codeService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");

/**
 * GET /api/codes/:code
 * Preview event details by join code (no auth required).
 * Frontend shows event info before the user confirms joining.
 */
const resolveCode = asyncHandler(async (req, res) => {
    const event = await codeService.getEventByCode(req.params.code);
    return sendResponse(res, 200, "Event found", event);
});

/**
 * POST /api/codes/:code/join
 * Join an event using its join code (auth required).
 * Body: { role? }  — defaults to "participant"
 */
const joinWithCode = asyncHandler(async (req, res) => {
    const { code } = req.params;
    const { role } = req.body;
    // req.user.userId comes from authMiddleware (JWT decoded)
    const userId = req.user.userId;

    const result = await codeService.joinEventByCode(userId, code, role);
    return sendResponse(res, 201, "Successfully joined the event", result);
});

/**
 * GET /api/codes/:eventId/registered-users
 * Get all registered users for an event — used by organizer to mark attendance.
 * Auth required (organizer).
 */
const getRegisteredUsers = asyncHandler(async (req, res) => {
    const users = await codeService.getRegisteredUsers(req.params.eventId);
    return sendResponse(res, 200, "Registered users fetched", users);
});

module.exports = {
    resolveCode,
    joinWithCode,
    getRegisteredUsers
};
