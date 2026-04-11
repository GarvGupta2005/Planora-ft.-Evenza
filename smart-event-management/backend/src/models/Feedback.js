const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        metrics: {
            venue: { type: Number, min: 1, max: 5 },
            content: { type: Number, min: 1, max: 5 },
            organization: { type: Number, min: 1, max: 5 }
        },
        comments: { type: String, trim: true }
    },
    { timestamps: true }
);

feedbackSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
