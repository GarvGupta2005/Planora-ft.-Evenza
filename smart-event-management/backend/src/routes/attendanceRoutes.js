const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const { markAttendanceValidator } = require("../validators/attendanceValidator");
const { ROLES } = require("../config/constants");

// POST /api/attendance/:eventId
// Organizer marks attendance for a specific user
// Body: { userId, isPresent }
router.post(
    "/:eventId",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    markAttendanceValidator,
    validateMiddleware,
    attendanceController.markAttendance
);

// POST /api/attendance/:eventId/self
// Participant self check-in (no body needed — uses their own token)
router.post(
    "/:eventId/self",
    authMiddleware,
    attendanceController.selfCheckIn
);

// GET /api/attendance/:eventId
// Get list of present attendees
router.get("/:eventId", authMiddleware, attendanceController.getEventAttendance);

// GET /api/attendance/:eventId/summary
// Get attendance summary stats (total, present, absent, rate)
router.get(
    "/:eventId/summary",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    attendanceController.getAttendanceSummary
);

// POST /api/attendance/:eventId/check-in
// Check-in by registration code (e.g. scanning QR code)
// Body: { regCode }
router.post(
    "/:eventId/check-in",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN, ROLES.VOLUNTEER),
    attendanceController.checkInByCode
);

module.exports = router;
