/**
 * dashboardSocket.js
 * Pushes live dashboard stat updates to connected admin/organizer clients.
 *
 * Room: "dashboard:admin"  — pushed with overall stats every 30s
 * Room: "dashboard:organizer:<organizerId>" — pushed per-organizer stats
 */
const dashboardService = require("../services/dashboardService");
const jwt = require("jsonwebtoken");

const initDashboardSocket = (io) => {
    const dashNs = io.of("/dashboard");

    // Socket auth middleware
    dashNs.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
        if (!token) {
            return next(new Error("Authentication error: token required"));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch {
            next(new Error("Authentication error: invalid token"));
        }
    });

    dashNs.on("connection", async (socket) => {
        const { userId, roles = [] } = socket.user || {};
        console.log(`[DashboardSocket] User ${userId} connected`);

        // Admin subscription — joins global admin room
        if (roles.includes("Admin")) {
            socket.join("dashboard:admin");
        }

        // Organizer subscription — joins their own room
        if (roles.includes("Organizer")) {
            socket.join(`dashboard:organizer:${userId}`);
        }

        // Push initial snapshot immediately on connect
        try {
            if (roles.includes("Admin")) {
                const stats = await dashboardService.getOverallStats();
                socket.emit("dashboard:stats", stats);
            }
            if (roles.includes("Organizer")) {
                const stats = await dashboardService.getOrganizerStats(userId);
                socket.emit("dashboard:organizer:stats", stats);
            }
        } catch (err) {
            socket.emit("error", { message: err.message });
        }

        socket.on("disconnect", () => {
            console.log(`[DashboardSocket] User ${userId} disconnected`);
        });
    });

    // Broadcast live stats every 30 seconds
    const INTERVAL_MS = 30_000;
    const interval = setInterval(async () => {
        try {
            // Overall stats → admin room
            const overallStats = await dashboardService.getOverallStats();
            dashNs.to("dashboard:admin").emit("dashboard:stats", overallStats);
        } catch (err) {
            console.error("[DashboardSocket] Failed to broadcast stats:", err.message);
        }
    }, INTERVAL_MS);

    // Clean up on server shutdown
    dashNs.on("close", () => clearInterval(interval));

    return dashNs;
};

module.exports = initDashboardSocket;
