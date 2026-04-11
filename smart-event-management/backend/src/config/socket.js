const { Server } = require("socket.io");
const initMessageSocket = require("../sockets/messageSocket");
const initDashboardSocket = require("../sockets/dashboardSocket");

const initSocket = (server) => {
    // Parse comma-separated origins
    const socketOrigins = (process.env.SOCKET_CORS_ORIGIN || process.env.CLIENT_URL || "*")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

    const io = new Server(server, {
        cors: {
            origin: socketOrigins.includes("*") ? "*" : socketOrigins,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true
        }
    });

    // Default connection log on root namespace
    io.on("connection", (socket) => {
        console.log(`[Socket] Root connection: ${socket.id}`);
        socket.on("disconnect", () => {
            console.log(`[Socket] Root disconnected: ${socket.id}`);
        });
    });

    // Initialise feature-specific namespaces
    initMessageSocket(io);
    initDashboardSocket(io);

    return io;
};

module.exports = initSocket;