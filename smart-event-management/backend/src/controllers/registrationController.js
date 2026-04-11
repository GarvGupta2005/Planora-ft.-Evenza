const registrationService = require("../services/registrationService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");

/**
 * POST /api/registrations/event/:eventId
 * Register the authenticated user for an event directly (no join code).
 * Body: { role? }
 */
const registerUser = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { role } = req.body;
    const userId = req.user.userId; // fixed: was req.user._id

    const registration = await registrationService.registerForEvent(userId, eventId, role);
    return sendResponse(res, 201, "Registered for event successfully", registration);
});

/**
 * GET /api/registrations/event/:eventId
 * Get all registrations for a specific event (organizer view).
 */
const getEventRegistrations = asyncHandler(async (req, res) => {
    const registrations = await registrationService.getRegistrationsByEvent(req.params.eventId);
    return sendResponse(res, 200, "Registrations fetched", registrations);
});

/**
 * GET /api/registrations/my-registrations
 * Get all events the authenticated user has registered for.
 */
const getMyRegistrations = asyncHandler(async (req, res) => {
    const userId = req.user.userId; // fixed: was req.user._id
    const registrations = await registrationService.getUserRegistrations(userId);
    return sendResponse(res, 200, "My registrations fetched", registrations);
});

/**
 * DELETE /api/registrations/event/:eventId/cancel
 * Cancel own registration.
 */
const cancelRegistration = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { eventId } = req.params;

    const registration = await registrationService.cancelRegistration(userId, eventId);
    return sendResponse(res, 200, "Registration cancelled", registration);
});

/**
 * PATCH /api/registrations/:id/attendance
 * Mark a participant as attended or registered (absent).
 */
const updateAttendance = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const registration = await registrationService.updateAttendance(req.params.id, status);
    return sendResponse(res, 200, "Attendance updated", registration);
});

/**
 * PATCH /api/registrations/:id/status
 * Approve, Reject, or Cancel a registration.
 */
const updateRegistrationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const registration = await registrationService.updateRegistrationStatus(req.params.id, status);
    return sendResponse(res, 200, `Registration status updated to ${status}`, registration);
});

/**
 * GET /api/registrations/organizer
 * Get all registrations across all events owned by the authenticated organizer.
 */
const getOrganizerRegistrations = asyncHandler(async (req, res) => {
    const registrations = await registrationService.getOrganizerRegistrations(req.user.userId);
    return sendResponse(res, 200, "Organizer registrations fetched", registrations);
});

module.exports = {
    registerUser,
    getEventRegistrations,
    getMyRegistrations,
    cancelRegistration,
    updateAttendance,
    updateRegistrationStatus,
    getOrganizerRegistrations
};
