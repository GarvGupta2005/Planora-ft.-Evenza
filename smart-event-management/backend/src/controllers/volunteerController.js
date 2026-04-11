const volunteerService = require("../services/volunteerService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");

/**
 * POST /api/volunteers/:eventId/tasks
 * Assign a volunteer task (organizer only).
 * Body: { userId, taskDescription }
 */
const assignTask = asyncHandler(async (req, res) => {
    const { userId, taskDescription } = req.body;
    const task = await volunteerService.assignTask(
        req.params.eventId,
        userId,
        taskDescription,
        req.user.userId
    );
    return sendResponse(res, 201, "Volunteer task assigned", task);
});

/**
 * GET /api/volunteers/:eventId/tasks
 * Get all tasks for an event.
 */
const getEventTasks = asyncHandler(async (req, res) => {
    const tasks = await volunteerService.getEventTasks(req.params.eventId);
    return sendResponse(res, 200, "Event tasks fetched", tasks);
});

/**
 * GET /api/volunteers/my-tasks
 * Get all tasks assigned to the authenticated volunteer.
 */
const getMyTasks = asyncHandler(async (req, res) => {
    const tasks = await volunteerService.getMyTasks(req.user.userId);
    return sendResponse(res, 200, "My tasks fetched", tasks);
});

/**
 * PATCH /api/volunteers/tasks/:taskId/status
 * Update the status of a task.
 * Body: { status: "pending" | "in-progress" | "completed" }
 */
const updateTaskStatus = asyncHandler(async (req, res) => {
    const task = await volunteerService.updateTaskStatus(
        req.params.taskId,
        req.body.status,
        req.user.userId,
        req.user.roles
    );
    return sendResponse(res, 200, "Task status updated", task);
});

/**
 * DELETE /api/volunteers/tasks/:taskId
 * Delete a task (organizer only).
 */
const deleteTask = asyncHandler(async (req, res) => {
    await volunteerService.deleteTask(req.params.taskId, req.user.userId);
    return sendResponse(res, 200, "Task deleted");
});

/**
 * GET /api/volunteers/organizer
 * Get all volunteers (registrations with role="volunteer") across all organizer events.
 */
const getOrganizerVolunteers = asyncHandler(async (req, res) => {
    const volunteers = await volunteerService.getOrganizerVolunteers(req.user.userId);
    return sendResponse(res, 200, "Organizer volunteers fetched", volunteers);
});

module.exports = {
    assignTask,
    getEventTasks,
    getMyTasks,
    updateTaskStatus,
    deleteTask,
    getOrganizerVolunteers
};
