const Attendance = require("../models/Attendance");
const Registration = require("../models/Registration");

exports.markAttendance = async (eventId, userId, isPresent) => {
    // Check registration first
    const isRegistered = await Registration.findOne({
        event: eventId,
        user: userId,
        status: "registered"
    });
    if (!isRegistered) throw new Error("User is not registered for this event.");

    return await Attendance.findOneAndUpdate(
        { event: eventId, user: userId },
        { isPresent, markedAt: isPresent ? new Date() : null },
        { upsert: true, new: true }
    ).populate("user", "fullName email avatar");
};

exports.getEventAttendance = async (eventId) => {
    return await Attendance.find({ event: eventId, isPresent: true })
        .populate("user", "fullName email avatar")
        .sort({ markedAt: -1 });
};

/**
 * Summary: total registered vs attended, attendance rate percentage.
 */
exports.getAttendanceSummary = async (eventId) => {
    const [totalRegistered, totalPresent, records] = await Promise.all([
        Registration.countDocuments({ event: eventId, status: "registered" }),
        Attendance.countDocuments({ event: eventId, isPresent: true }),
        Attendance.find({ event: eventId })
            .populate("user", "fullName email avatar")
            .sort({ createdAt: 1 })
    ]);

    const rate = totalRegistered > 0
        ? parseFloat(((totalPresent / totalRegistered) * 100).toFixed(1))
        : 0;

    return {
        totalRegistered,
        totalPresent,
        totalAbsent: totalRegistered - totalPresent,
        attendanceRate: rate,
        records
    };
};
/**
 * Mark attendance using a registration code (Organizer scanning participant's code).
 */
exports.checkInByCode = async (regCode, eventId, organizerId) => {
    // 1. Find registration by code
    const registration = await Registration.findOne({ regCode }).populate("event");
    if (!registration) throw new Error("Invalid registration code.");

    // 2. Validate event and organizer
    if (registration.event._id.toString() !== eventId.toString()) {
        throw new Error("This registration code belongs to a different event.");
    }
    if (registration.event.organizer.toString() !== organizerId.toString()) {
        throw new Error("Unauthorized: you are not the organizer of this event.");
    }

    if (registration.status === "cancelled") {
        throw new Error("This registration has been cancelled.");
    }

    // 3. Mark as attended
    registration.status = "attended";
    await registration.save();

    // 4. Update attendance record
    const attendance = await Attendance.findOneAndUpdate(
        { event: eventId, user: registration.user },
        { isPresent: true, markedAt: new Date() },
        { upsert: true, new: true }
    ).populate("user", "fullName email avatar");

    return attendance;
};
