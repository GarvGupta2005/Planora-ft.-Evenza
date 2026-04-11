const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    type: { type: String, enum: ["attendance", "volunteer"], default: "attendance" },
    // Unique human-readable verification ID, e.g. CERT-ABC123-1A2B
    certificateId: { type: String, unique: true, required: true },
    issuedAt: { type: Date, default: Date.now },
    // Optional URL if a PDF was generated and stored
    url: { type: String }
}, { timestamps: true });

// Prevent issuing duplicate certificate for same user+event+type
certificateSchema.index({ user: 1, event: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", certificateSchema);
