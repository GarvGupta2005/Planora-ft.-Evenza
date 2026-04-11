const mongoose = require("mongoose");
const Event = require("../models/Event");

const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createEvent = async (payload, userId) => {
    let joinCode = generateJoinCode();

    while (await Event.findOne({ joinCode })) {
        joinCode = generateJoinCode();
    }

    const event = await Event.create({
        ...payload,
        joinCode,
        organizer: userId
    });

    return event;
};

const getAllEvents = async () => {
    return Event.find().populate("organizer", "fullName email").sort({ createdAt: -1 });
};

const getMyEvents = async (userId) => {
    return await Event.aggregate([
        { $match: { organizer: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: "registrations",
                localField: "_id",
                foreignField: "event",
                as: "registrations"
            }
        },
        {
            $addFields: {
                registrationCount: { $size: "$registrations" }
            }
        },
        { $project: { registrations: 0 } },
        { $sort: { createdAt: -1 } }
    ]);
};

const getEventById = async (eventId) => {
    const event = await Event.findById(eventId).populate("organizer", "fullName email");

    if (!event) {
        const error = new Error("Event not found");
        error.statusCode = 404;
        throw error;
    }

    return event;
};

const updateEvent = async (eventId, payload, userId) => {
    const event = await Event.findById(eventId);

    if (!event) {
        const error = new Error("Event not found");
        error.statusCode = 404;
        throw error;
    }

    if (event.organizer.toString() !== userId) {
        const error = new Error("Unauthorized to update this event");
        error.statusCode = 403;
        throw error;
    }

    Object.assign(event, payload);
    await event.save();

    return event;
};

const deleteEvent = async (eventId, userId) => {
    const event = await Event.findById(eventId);

    if (!event) {
        const error = new Error("Event not found");
        error.statusCode = 404;
        throw error;
    }

    if (event.organizer.toString() !== userId) {
        const error = new Error("Unauthorized to delete this event");
        error.statusCode = 403;
        throw error;
    }

    await event.deleteOne();

    return true;
};

module.exports = {
    createEvent,
    getAllEvents,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent
};