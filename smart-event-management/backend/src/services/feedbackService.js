const Feedback = require("../models/Feedback");
const mongoose = require("mongoose");

exports.submitFeedback = async (userId, eventId, feedbackData) => {
    const existing = await Feedback.findOne({ user: userId, event: eventId });
    if (existing) {
        const err = new Error("You have already submitted feedback for this event");
        err.statusCode = 409;
        throw err;
    }
    const feedback = new Feedback({
        user: userId,
        event: eventId,
        ...feedbackData
    });
    return await feedback.save();
};

exports.getEventFeedback = async (eventId) => {
    return await Feedback.find({ event: eventId })
        .populate("user", "fullName")
        .sort({ createdAt: -1 });
};

exports.getFeedbackStats = async (eventId) => {
    const eid = new mongoose.Types.ObjectId(eventId);
    const stats = await Feedback.aggregate([
        { $match: { event: eid } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: "$rating" },
                avgVenue: { $avg: "$metrics.venue" },
                avgContent: { $avg: "$metrics.content" },
                avgOrganization: { $avg: "$metrics.organization" },
                totalReviews: { $sum: 1 }
            }
        }
    ]);
    return stats[0] || null;
};

/**
 * Rating trend over time — groups feedback by day, returns avgRating per day.
 * Useful for a line chart on the dashboard.
 */
exports.getFeedbackTrends = async (eventId) => {
    const eid = new mongoose.Types.ObjectId(eventId);
    return await Feedback.aggregate([
        { $match: { event: eid } },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                avgRating: { $avg: "$rating" },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", avgRating: 1, count: 1, _id: 0 } }
    ]);
};

/**
 * Delete a feedback entry — only the author or an Admin may delete.
 */
exports.deleteFeedback = async (feedbackId, requestingUserId, userRoles) => {
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
        const err = new Error("Feedback not found");
        err.statusCode = 404;
        throw err;
    }

    const isAuthor = feedback.user.toString() === requestingUserId.toString();
    const isAdmin = Array.isArray(userRoles) && userRoles.includes("Admin");

    if (!isAuthor && !isAdmin) {
        const err = new Error("You are not authorized to delete this feedback");
        err.statusCode = 403;
        throw err;
    }

    await feedback.deleteOne();
    return true;
};

exports.getUserFeedback = async (userId) => {
    return await Feedback.find({ user: userId })
        .populate("event", "title")
        .sort({ createdAt: -1 });
};

/**
 * Get all feedback for events owned by a specific organizer.
 */
exports.getOrganizerFeedback = async (organizerId) => {
    const Event = require("../models/Event");
    const events = await Event.find({ organizer: organizerId }).select("_id");
    const eventIds = events.map(e => e._id);
    
    return await Feedback.find({ event: { $in: eventIds } })
        .populate("user", "fullName")
        .populate("event", "title color")
        .sort({ createdAt: -1 });
};
