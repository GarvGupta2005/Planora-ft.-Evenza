const mongoose = require("mongoose");

/**
 * Notification model — used for in-app alerts to users.
 * e.g. "Your certificate is ready", "A new message in Event X"
 */
const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: [
                "certificate_issued",
                "event_reminder",
                "new_message",
                "registration_confirmed",
                "feedback_request",
                "volunteer_assigned",
                "general",
                "broadcast"
            ],
            default: "general"
        },
        priority: {
            type: String,
            enum: ["normal", "important", "urgent"],
            default: "normal"
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        body: {
            type: String,
            trim: true
        },
        // Optional reference to the related entity (event, certificate, etc.)
        refModel: {
            type: String,
            enum: ["Event", "Certificate", "Message", "Registration", null],
            default: null
        },
        refId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Index for fetching a user's unread notifications quickly
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
