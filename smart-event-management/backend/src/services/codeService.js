const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { generateRegCode } = require("../utils/generateCode");

/**
 * Find event by join code. Throws if not found or event is cancelled.
 */
exports.getEventByCode = async (joinCode) => {
    const event = await Event.findOne({ joinCode: joinCode.toUpperCase().trim() })
        .populate("organizer", "fullName email")
        .select("-__v");

    if (!event) {
        const err = new Error("Invalid join code. No event found.");
        err.statusCode = 404;
        throw err;
    }

    if (event.status === "cancelled") {
        const err = new Error("This event has been cancelled.");
        err.statusCode = 400;
        throw err;
    }

    return event;
};

/**
 * Join an event using a join code — registers the user.
 * Returns both the registration record and the event details.
 */
exports.joinEventByCode = async (userId, joinCode, role = "participant") => {
    // 1. Resolve the event
    const event = await exports.getEventByCode(joinCode);

    // 2. Prevent organizer from joining their own event
    if (event.organizer._id.toString() === userId.toString()) {
        const err = new Error("You cannot join your own event as a participant.");
        err.statusCode = 400;
        throw err;
    }

    // 3. Check capacity
    const currentCount = await Registration.countDocuments({
        event: event._id,
        status: "registered"
    });

    if (currentCount >= event.capacity) {
        const err = new Error("This event has reached its maximum capacity.");
        err.statusCode = 400;
        throw err;
    }

    // 4. Prevent duplicate registration
    const existing = await Registration.findOne({ user: userId, event: event._id });
    if (existing) {
        const err = new Error("You are already registered for this event.");
        err.statusCode = 409;
        throw err;
    }

    // 5. Check registration deadline
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        const err = new Error("Registration deadline for this event has passed.");
        err.statusCode = 400;
        throw err;
    }

    // 6. Create registration
    const regCode = generateRegCode();
    const registration = await Registration.create({
        user: userId,
        event: event._id,
        role,
        regCode
    });

    return {
        registration: await registration.populate("event", "title eventDate venue startTime endTime joinCode"),
        event
    };
};

/**
 * Get all registered users for an event (for attendance marking).
 * Returns user details with registration info.
 */
exports.getRegisteredUsers = async (eventId) => {
    return Registration.find({ event: eventId, status: "registered" })
        .populate("user", "fullName email avatar")
        .sort({ createdAt: 1 });
};
