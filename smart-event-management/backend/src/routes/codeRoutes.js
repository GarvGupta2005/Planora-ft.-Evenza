const express = require("express");
const router = express.Router();
const codeController = require("../controllers/codeController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { ROLES } = require("../config/constants");

// GET /api/codes/:code
// Preview event details by join code (public — no auth needed)
router.get("/:code", codeController.resolveCode);

// POST /api/codes/:code/join
// Join event using its code (authenticated user)
// Body: { role? }  — defaults to "participant"
router.post("/:code/join", authMiddleware, codeController.joinWithCode);

// GET /api/codes/:eventId/registered-users
// Get all registered users for an event — for organizer's attendance screen
router.get(
    "/:eventId/registered-users",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    codeController.getRegisteredUsers
);

module.exports = router;
