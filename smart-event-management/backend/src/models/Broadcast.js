const mongoose = require("mongoose");

/**
 * Broadcast model — stores records of announcements sent by organizers.
 */
const broadcastSchema = new mongoose.Schema(
    {
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        body: {
            type: String,
            required: true,
            trim: true
        },
        targetAudience: {
            type: String,
            enum: ["all", "participants", "volunteers"],
            default: "all"
        },
        priority: {
            type: String,
            enum: ["normal", "important", "urgent"],
            default: "normal"
        },
        recipientCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Broadcast", broadcastSchema);
