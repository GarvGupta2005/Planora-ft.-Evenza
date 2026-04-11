const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Attendance = require("../models/Attendance");
const Feedback = require("../models/Feedback");
const VolunteerTask = require("../models/Volunteer");
const { lastNMonths, startOfMonth, endOfMonth, formatMonthLabel } = require("../utils/dateHelpers");

/**
 * Platform-wide overview stats (Admin use).
 */
const getOverallStats = async () => {
    const [totalUsers, totalEvents, totalRegistrations, totalVolunteers] = await Promise.all([
        User.countDocuments(),
        Event.countDocuments(),
        Registration.countDocuments(),
        VolunteerTask.countDocuments()
    ]);

    const eventsByStatus = await Event.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusMap = {};
    eventsByStatus.forEach(({ _id, count }) => {
        statusMap[_id] = count;
    });

    return {
        totalUsers,
        totalEvents,
        totalRegistrations,
        totalVolunteers,
        eventsByStatus: statusMap
    };
};

/**
 * Per-event summary stats for an organizer's dashboard card.
 */
const getEventSummary = async (eventId) => {
    const mongoose = require("mongoose");
    const eid = new mongoose.Types.ObjectId(eventId);

    const [totalRegistrations, attendees, feedbackStats, volunteerCount] = await Promise.all([
        Registration.countDocuments({ event: eid }),
        Attendance.countDocuments({ event: eid, isPresent: true }),
        Feedback.aggregate([
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
        ]),
        VolunteerTask.countDocuments({ event: eid })
    ]);

    const attendanceRate = totalRegistrations > 0
        ? parseFloat(((attendees / totalRegistrations) * 100).toFixed(1))
        : 0;

    return {
        totalRegistrations,
        attendees,
        attendanceRate,
        volunteerCount,
        feedback: feedbackStats[0] || {
            avgRating: 0,
            avgVenue: 0,
            avgContent: 0,
            avgOrganization: 0,
            totalReviews: 0
        }
    };
};

/**
 * Monthly registration chart data for the past N months.
 */
const getMonthlyRegistrations = async (months = 6) => {
    const monthRanges = lastNMonths(months);

    const results = await Promise.all(
        monthRanges.map(async ({ year, month }) => {
            const start = startOfMonth(year, month);
            const end = endOfMonth(year, month);
            const count = await Registration.countDocuments({
                createdAt: { $gte: start, $lte: end }
            });
            return { label: formatMonthLabel(year, month), count };
        })
    );

    return results;
};

/**
 * Monthly events created per month for past N months.
 */
const getMonthlyEvents = async (months = 6) => {
    const monthRanges = lastNMonths(months);

    const results = await Promise.all(
        monthRanges.map(async ({ year, month }) => {
            const start = startOfMonth(year, month);
            const end = endOfMonth(year, month);
            const count = await Event.countDocuments({
                createdAt: { $gte: start, $lte: end }
            });
            return { label: formatMonthLabel(year, month), count };
        })
    );

    return results;
};

/**
 * Organizer-specific stats — only events owned by this organizer.
 */
const getOrganizerStats = async (organizerId) => {
    const mongoose = require("mongoose");
    const oid = new mongoose.Types.ObjectId(organizerId);

    const events = await Event.find({ organizer: oid }).select("_id status");
    const eventIds = events.map((e) => e._id);

    const [totalRegistrations, totalAttendees, totalVolunteers] = await Promise.all([
        Registration.countDocuments({ event: { $in: eventIds } }),
        Attendance.countDocuments({ event: { $in: eventIds }, isPresent: true }),
        VolunteerTask.countDocuments({ event: { $in: eventIds } })
    ]);

    const statusMap = {};
    events.forEach(({ status }) => {
        statusMap[status] = (statusMap[status] || 0) + 1;
    });

    return {
        totalEvents: events.length,
        eventsByStatus: statusMap,
        totalRegistrations,
        totalAttendees,
        totalVolunteers
    };
};

module.exports = {
    getOverallStats,
    getEventSummary,
    getMonthlyRegistrations,
    getMonthlyEvents,
    getOrganizerStats
};
