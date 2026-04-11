const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            default: "general",
            trim: true
        },
        venue: {
            type: String,
            required: true,
            trim: true
        },
        eventDate: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        capacity: {
            type: Number,
            required: true,
            min: 1
        },
        color: String,
        emoji: String,
        endDate: Date,
        isVirtual: Boolean,
        virtualLink: String,
        registrationDeadline: {
            type: Date
        },
        joinCode: {
            type: String,
            unique: true,
            required: true
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["draft", "published", "completed", "cancelled"],
            default: "published"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);