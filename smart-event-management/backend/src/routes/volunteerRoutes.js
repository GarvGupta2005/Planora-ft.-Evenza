const express = require("express");
const router = express.Router();

const volunteerController = require("../controllers/volunteerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const { assignTaskValidator, updateTaskStatusValidator } = require("../validators/volunteerValidator");
const { ROLES } = require("../config/constants");

// GET /api/volunteers/my-tasks — tasks for the authenticated volunteer
router.get("/my-tasks", authMiddleware, volunteerController.getMyTasks);

// GET /api/volunteers/organizer — all volunteers for the authenticated organizer
router.get(
    "/organizer",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    volunteerController.getOrganizerVolunteers
);

// POST /api/volunteers/:eventId/tasks — assign a task (organizer only)
router.post(
    "/:eventId/tasks",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    assignTaskValidator,
    validateMiddleware,
    volunteerController.assignTask
);

// GET /api/volunteers/:eventId/tasks — list tasks for an event
router.get(
    "/:eventId/tasks",
    authMiddleware,
    volunteerController.getEventTasks
);

// PATCH /api/volunteers/tasks/:taskId/status — update task status
router.patch(
    "/tasks/:taskId/status",
    authMiddleware,
    updateTaskStatusValidator,
    validateMiddleware,
    volunteerController.updateTaskStatus
);

// DELETE /api/volunteers/tasks/:taskId — delete a task (organizer only)
router.delete(
    "/tasks/:taskId",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    volunteerController.deleteTask
);

module.exports = router;
