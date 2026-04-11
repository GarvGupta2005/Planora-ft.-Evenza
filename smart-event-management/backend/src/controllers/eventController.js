const eventService = require("../services/eventService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");

const createEvent = asyncHandler(async (req, res) => {
    const event = await eventService.createEvent(req.body, req.user.userId);
    return sendResponse(res, 201, "Event created successfully", event);
});

const getAllEvents = asyncHandler(async (req, res) => {
    const events = await eventService.getAllEvents();
    return sendResponse(res, 200, "Events fetched successfully", events);
});

const getMyEvents = asyncHandler(async (req, res) => {
    const events = await eventService.getMyEvents(req.user.userId);
    return sendResponse(res, 200, "My events fetched successfully", events);
});

const getEventById = asyncHandler(async (req, res) => {
    const event = await eventService.getEventById(req.params.id);
    return sendResponse(res, 200, "Event fetched successfully", event);
});

const updateEvent = asyncHandler(async (req, res) => {
    const event = await eventService.updateEvent(req.params.id, req.body, req.user.userId);
    return sendResponse(res, 200, "Event updated successfully", event);
});

const deleteEvent = asyncHandler(async (req, res) => {
    await eventService.deleteEvent(req.params.id, req.user.userId);
    return sendResponse(res, 200, "Event deleted successfully");
});

const uploadBanner = asyncHandler(async (req, res) => {
    if (!req.file) {
        const err = new Error("No image file provided");
        err.statusCode = 400;
        throw err;
    }

    const event = await eventService.getEventById(req.params.id);
    if (event.organizer._id.toString() !== req.user.userId.toString()) {
        const err = new Error("Only the organizer can upload a banner for this event");
        err.statusCode = 403;
        throw err;
    }

    event.banner = `/uploads/${req.file.filename}`;
    await event.save();

    return sendResponse(res, 200, "Event banner updated", { banner: event.banner });
});

module.exports = {
    createEvent,
    getAllEvents,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    uploadBanner
};