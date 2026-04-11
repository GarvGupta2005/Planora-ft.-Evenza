const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
        isPresent: { type: Boolean, default: false },
        markedAt: { type: Date }
    },
    { timestamps: true }
);

attendanceSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
