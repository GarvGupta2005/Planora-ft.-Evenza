const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        role: {
            type: String,
            enum: ["participant", "volunteer"],
            default: "participant"
        },
        status: {
            type: String,
            enum: ["registered", "cancelled", "attended"],
            default: "registered"
        },
        regCode: {
            type: String,
            unique: true,
            required: true
        }
    },
    { timestamps: true }
);

// Prevent user from registering multiple times for the same event
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
