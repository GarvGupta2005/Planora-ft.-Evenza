const Event = require("../models/Event");

/**
 * Fine-grained resource access middleware.
 * Checks that the requesting user is the organizer of a given event.
 * 
 * Usage: router.patch("/:id", authMiddleware, requireEventOrganizer, handler)
 * Expects req.params.id (or req.params.eventId) to be the event's _id.
 */
const requireEventOrganizer = async (req, res, next) => {
    try {
        const eventId = req.params.eventId || req.params.id;
        if (!eventId) {
            return res.status(400).json({ success: false, message: "Event ID is required" });
        }

        const event = await Event.findById(eventId).select("organizer");
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        if (event.organizer.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: only the event organizer can perform this action"
            });
        }

        req.event = event; // attach for downstream use
        next();
    } catch (err) {
        next(err);
    }
};

/**
 * Middleware that allows access only to the resource owner OR an admin.
 * Expects req.params.userId to match the requesting user's id.
 */
const requireSelfOrAdmin = (req, res, next) => {
    const { userId: paramUserId } = req.params;
    const { userId: tokenUserId, roles } = req.user;

    const isSelf = paramUserId && paramUserId.toString() === tokenUserId.toString();
    const isAdmin = Array.isArray(roles) && roles.includes("Admin");

    if (!isSelf && !isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Forbidden: you can only access your own resources"
        });
    }

    next();
};

module.exports = { requireEventOrganizer, requireSelfOrAdmin };
