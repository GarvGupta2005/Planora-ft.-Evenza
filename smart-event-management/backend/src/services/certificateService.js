const Certificate = require("../models/Certificate");
const Attendance = require("../models/Attendance");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const User = require("../models/User");
const { generateCertificateId } = require("../utils/generateCode");
const notificationService = require("./notificationService");

/**
 * Issue a certificate for a user who attended/volunteered at an event.
 * - Validates attendance or volunteer registration
 * - Prevents duplicate issuance
 */
const issueCertificate = async (userId, eventId, type = "attendance") => {
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
        const err = new Error("Event not found");
        err.statusCode = 404;
        throw err;
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    // Check attendance for attendance-type certificates
    if (type === "attendance") {
        const attended = await Attendance.findOne({ user: userId, event: eventId, isPresent: true });
        if (!attended) {
            const err = new Error("User has not attended this event");
            err.statusCode = 400;
            throw err;
        }
    }

    // Check volunteer registration for volunteer-type certificates
    if (type === "volunteer") {
        const reg = await Registration.findOne({ user: userId, event: eventId, role: "volunteer" });
        if (!reg) {
            const err = new Error("User is not a volunteer for this event");
            err.statusCode = 400;
            throw err;
        }
    }

    // Prevent duplicate certificate
    const existing = await Certificate.findOne({ user: userId, event: eventId, type });
    if (existing) {
        const err = new Error("Certificate already issued for this user and event");
        err.statusCode = 409;
        throw err;
    }

    const certificateId = generateCertificateId();

    const certificate = await Certificate.create({
        user: userId,
        event: eventId,
        type,
        certificateId,
        issuedAt: new Date()
    });

    // Notify the user
    await notificationService.createNotification(userId, {
        type: "certificate_issued",
        title: "Certificate Issued!",
        body: `Your certificate for "${event.title}" is now available.`,
        refModel: "Certificate",
        refId: certificate._id
    });

    return certificate.populate([
        { path: "user", select: "fullName email" },
        { path: "event", select: "title eventDate venue" }
    ]);
};

/**
 * Get all certificates for a specific user.
 */
const getMyCertificates = async (userId) => {
    return Certificate.find({ user: userId })
        .populate("event", "title eventDate venue organizer")
        .sort({ issuedAt: -1 });
};

/**
 * Verify a certificate by its unique certificateId string.
 */
const verifyCertificate = async (certificateId) => {
    const cert = await Certificate.findOne({ certificateId })
        .populate("user", "fullName email")
        .populate("event", "title eventDate venue");

    if (!cert) {
        const err = new Error("Certificate not found or invalid");
        err.statusCode = 404;
        throw err;
    }

    return cert;
};

/**
 * Get all certificates issued for a specific event (organizer dashboard use).
 */
const getCertificatesByEvent = async (eventId) => {
    return Certificate.find({ event: eventId })
        .populate("user", "fullName email")
        .sort({ issuedAt: -1 });
};

module.exports = {
    issueCertificate,
    getMyCertificates,
    verifyCertificate,
    getCertificatesByEvent
};
