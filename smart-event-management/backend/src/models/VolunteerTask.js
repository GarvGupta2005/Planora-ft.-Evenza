const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    taskDescription: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
    dueDate: { type: Date },
    assignedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("VolunteerTask", volunteerSchema);
