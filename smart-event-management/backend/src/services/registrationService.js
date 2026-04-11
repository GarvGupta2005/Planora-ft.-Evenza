const Registration = require("../models/Registration");
const Event = require("../models/Event");
const Attendance = require("../models/Attendance");
const notificationService = require("./notificationService");
const { generateRegCode } = require("../utils/generateCode");

exports.registerForEvent = async (userId, eventId, role = "participant") => {
    // 1. Check if event exists
    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    if (event.status === "cancelled") throw new Error("This event has been cancelled.");

    // 2. Check if user is already registered
    const existingReq = await Registration.findOne({ user: userId, event: eventId });
    if (existingReq) throw new Error("You are already registered for this event.");

    // 3. Check registration deadline
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        throw new Error("Registration deadline for this event has passed.");
    }

    // 4. Check capacity limits
    const currentRegistrations = await Registration.countDocuments({ event: eventId, status: "registered" });
    if (currentRegistrations >= event.capacity) {
        throw new Error("Event capacity has been reached.");
    }

    // 5. Create registration
    const regCode = generateRegCode();
    const registration = new Registration({ user: userId, event: eventId, role, regCode });
    await registration.save();

    // Notify the user
    await notificationService.createNotification(userId, {
        type: "registration_confirmed",
        title: "Registration Confirmed!",
        body: `You are now registered for "${event.title}".`,
        refModel: "Event",
        refId: eventId
    });

    return registration.populate("event", "title eventDate venue startTime endTime");
};

exports.getRegistrationsByEvent = async (eventId) => {
    return await Registration.find({ event: eventId })
        .populate("user", "fullName email avatar")
        .sort({ createdAt: -1 });
};

exports.getUserRegistrations = async (userId) => {
    return await Registration.find({ user: userId })
        .populate("event", "title eventDate startTime endTime venue status joinCode organizer")
        .sort({ createdAt: -1 });
};

exports.cancelRegistration = async (userId, eventId) => {
    const registration = await Registration.findOne({ user: userId, event: eventId });
    if (!registration) throw new Error("Registration not found.");

    if (registration.status === "cancelled") throw new Error("Registration is already cancelled.");

    registration.status = "cancelled";
    await registration.save();
    return registration;
};

exports.updateAttendance = async (registrationId, status) => {
    const registration = await Registration.findById(registrationId);
    if (!registration) throw new Error("Registration not found.");

    if (!["registered", "attended"].includes(status)) {
        throw new Error("Invalid status. Use 'attended' (present) or 'registered' (absent/pending).");
    }

    registration.status = status;
    if (status === "attended") {
        registration.checkInTime = new Date();
        // Sync with Attendance record
        await Attendance.findOneAndUpdate(
            { event: registration.event, user: registration.user },
            { isPresent: true, markedAt: registration.checkInTime },
            { upsert: true }
        );
    } else {
        registration.checkInTime = null;
        // Mark as absent in Attendance record
        await Attendance.findOneAndUpdate(
            { event: registration.event, user: registration.user },
            { isPresent: false, markedAt: null },
            { upsert: true }
        );
    }

    await registration.save();
    return registration.populate("user", "fullName email");
};

exports.updateRegistrationStatus = async (registrationId, status) => {
    const registration = await Registration.findById(registrationId);
    if (!registration) throw new Error("Registration not found.");

    registration.status = status;
    await registration.save();
    return registration.populate("user", "fullName email");
};

exports.getOrganizerRegistrations = async (organizerId) => {
    // Find all events by this organizer
    const events = await Event.find({ organizer: organizerId }).select("_id");
    const eventIds = events.map(e => e._id);
    
    return await Registration.find({ event: { $in: eventIds } })
        .populate("user", "fullName email avatar")
        .populate("event", "title")
        .sort({ createdAt: -1 });
};
