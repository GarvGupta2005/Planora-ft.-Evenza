const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const { registerForEventValidator } = require("../validators/registrationValidator");
const { ROLES } = require("../config/constants");

// GET /api/registrations/my-registrations
// All events the logged-in user has registered for
router.get("/my-registrations", authMiddleware, registrationController.getMyRegistrations);

// GET /api/registrations/organizer
// All registrations across all owned events
router.get(
    "/organizer",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    registrationController.getOrganizerRegistrations
);

// GET /api/registrations/event/:eventId
// All registrations for a specific event (organizer view)
router.get(
    "/event/:eventId",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    registrationController.getEventRegistrations
);

// POST /api/registrations/event/:eventId
// Direct register by eventId (alternative to code-based joining)
// Body: { role? }
router.post(
    "/event/:eventId",
    authMiddleware,
    registerForEventValidator,
    validateMiddleware,
    registrationController.registerUser
);

// DELETE /api/registrations/event/:eventId/cancel
// Cancel own registration
router.delete(
    "/event/:eventId/cancel",
    authMiddleware,
    registrationController.cancelRegistration
);

// PATCH /api/registrations/:id/attendance
// Mark attendance (Organizers only)
router.patch(
    "/:id/attendance",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    registrationController.updateAttendance
);

// PATCH /api/registrations/:id/status
// Approve/Reject registration
router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    registrationController.updateRegistrationStatus
);

module.exports = router;
