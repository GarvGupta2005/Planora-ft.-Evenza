const attendanceService = require("../services/attendanceService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");

/**
 * POST /api/attendance/:eventId
 * Mark or update attendance for a user.
 * Body: { userId, isPresent }
 * Auth: organizer token
 */
const markAttendance = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { userId, isPresent } = req.body;

    const record = await attendanceService.markAttendance(eventId, userId, isPresent);
    return sendResponse(res, 200, `Attendance marked as ${isPresent ? "present" : "absent"}`, record);
});

/**
 * POST /api/attendance/:eventId/self
 * Participant marks their own attendance (self check-in).
 */
const selfCheckIn = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const record = await attendanceService.markAttendance(eventId, userId, true);
    return sendResponse(res, 200, "Check-in successful", record);
});

/**
 * GET /api/attendance/:eventId
 * Get all present attendees for an event.
 */
const getEventAttendance = asyncHandler(async (req, res) => {
    const attendance = await attendanceService.getEventAttendance(req.params.eventId);
    return sendResponse(res, 200, "Attendance fetched", attendance);
});

/**
 * GET /api/attendance/:eventId/summary
 * Get attendance summary: total registered vs present, rate.
 */
const getAttendanceSummary = asyncHandler(async (req, res) => {
    const summary = await attendanceService.getAttendanceSummary(req.params.eventId);
    return sendResponse(res, 200, "Attendance summary fetched", summary);
});

/**
 * POST /api/attendance/:eventId/check-in
 * Body: { regCode }
 */
const checkInByCode = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { regCode } = req.body;
    const organizerId = req.user.userId;

    const record = await attendanceService.checkInByCode(regCode, eventId, organizerId);
    return sendResponse(res, 200, "Check-in successful", record);
});

module.exports = {
    markAttendance,
    selfCheckIn,
    getEventAttendance,
    getAttendanceSummary,
    checkInByCode
};
