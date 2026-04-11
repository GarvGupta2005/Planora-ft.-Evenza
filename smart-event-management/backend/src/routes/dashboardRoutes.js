const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { ROLES } = require("../config/constants");

// GET /api/dashboard/stats — overall platform stats (Admin)
router.get(
    "/stats",
    authMiddleware,
    roleMiddleware(ROLES.ADMIN),
    dashboardController.getOverallStats
);

// GET /api/dashboard/organizer — authenticated organizer's own stats
router.get(
    "/organizer",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    dashboardController.getOrganizerStats
);

// GET /api/dashboard/events/:eventId/summary — per-event summary card
router.get(
    "/events/:eventId/summary",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    dashboardController.getEventSummary
);

// GET /api/dashboard/charts/registrations?months=6
router.get(
    "/charts/registrations",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    dashboardController.getMonthlyRegistrations
);

// GET /api/dashboard/charts/events?months=6
router.get(
    "/charts/events",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    dashboardController.getMonthlyEvents
);

module.exports = router;
