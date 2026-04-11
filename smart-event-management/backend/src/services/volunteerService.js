const VolunteerTask = require("../models/Volunteer");
const Event = require("../models/Event");
const User = require("../models/User");
const Registration = require("../models/Registration");
const notificationService = require("./notificationService");

/**
 * Assign a volunteer task to a user for an event.
 * - Validates event and user
 * - Ensures user is registered as a volunteer for the event
 */
const assignTask = async (eventId, userId, taskDescription, organizerId) => {
    const event = await Event.findById(eventId);
    if (!event) {
        const err = new Error("Event not found");
        err.statusCode = 404;
        throw err;
    }

    // Only the organizer of the event may assign tasks
    if (event.organizer.toString() !== organizerId.toString()) {
        const err = new Error("Only the event organizer can assign volunteer tasks");
        err.statusCode = 403;
        throw err;
    }

    const user = await User.findById(userId);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    if (!taskDescription || !taskDescription.trim()) {
        const err = new Error("Task description is required");
        err.statusCode = 400;
        throw err;
    }

    const task = await VolunteerTask.create({
        user: userId,
        event: eventId,
        taskDescription: taskDescription.trim()
    });

    // Notify the user about the new task assignment
    await notificationService.createNotification(userId, {
        type: "volunteer_assigned",
        title: "New Task Assigned",
        body: `You have been assigned a new task for event: ${event.title}`,
        refModel: "Event",
        refId: eventId
    });

    return task.populate([
        { path: "user", select: "fullName email" },
        { path: "event", select: "title eventDate" }
    ]);
};

/**
 * Get all volunteer tasks for an event.
 */
const getEventTasks = async (eventId) => {
    return VolunteerTask.find({ event: eventId })
        .populate("user", "fullName email")
        .sort({ assignedAt: -1 });
};

/**
 * Get all tasks assigned to a specific volunteer (user).
 */
const getMyTasks = async (userId) => {
    return VolunteerTask.find({ user: userId })
        .populate("event", "title eventDate venue")
        .sort({ assignedAt: -1 });
};

/**
 * Update the status of a volunteer task.
 * - The assigned volunteer OR the organizer can update the status.
 */
const updateTaskStatus = async (taskId, status, requestingUserId, userRoles) => {
    const task = await VolunteerTask.findById(taskId).populate("event", "organizer");
    if (!task) {
        const err = new Error("Task not found");
        err.statusCode = 404;
        throw err;
    }

    const validStatuses = ["pending", "in-progress", "completed"];
    if (!validStatuses.includes(status)) {
        const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
        err.statusCode = 400;
        throw err;
    }

    const isAssignee = task.user.toString() === requestingUserId.toString();
    const isOrganizer = task.event.organizer.toString() === requestingUserId.toString();
    const isAdmin = Array.isArray(userRoles) && userRoles.includes("Admin");

    if (!isAssignee && !isOrganizer && !isAdmin) {
        const err = new Error("You are not authorized to update this task");
        err.statusCode = 403;
        throw err;
    }

    task.status = status;
    await task.save();

    return task.populate([
        { path: "user", select: "fullName email" },
        { path: "event", select: "title eventDate" }
    ]);
};

/**
 * Delete a volunteer task (organizer only).
 */
const deleteTask = async (taskId, organizerId) => {
    const task = await VolunteerTask.findById(taskId).populate("event", "organizer");
    if (!task) {
        const err = new Error("Task not found");
        err.statusCode = 404;
        throw err;
    }

    if (task.event.organizer.toString() !== organizerId.toString()) {
        const err = new Error("Only the event organizer can delete tasks");
        err.statusCode = 403;
        throw err;
    }

    await task.deleteOne();
    return true;
};

/**
 * Get all volunteers across all events owned by an organizer.
 */
const getOrganizerVolunteers = async (organizerId) => {
    const events = await Event.find({ organizer: organizerId }).select("_id");
    const eventIds = events.map(e => e._id);
    
    // Find all registrations for these events with role "volunteer"
    const registrations = await Registration.find({ 
        event: { $in: eventIds },
        role: "volunteer"
    }).populate("user", "fullName email avatar").populate("event", "title");

    return registrations;
};

module.exports = {
    assignTask,
    getEventTasks,
    getMyTasks,
    updateTaskStatus,
    deleteTask,
    getOrganizerVolunteers
};
