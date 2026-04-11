/**
 * messageSocket.js
 * Real-time messaging via Socket.IO.
 * 
 * Rooms: each event has its own room named "event:<eventId>"
 * Events emitted to clients: "message:new", "message:deleted", "message:pinned"
 */
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");

const initMessageSocket = (io) => {
    // Namespace for messages
    const msgNs = io.of("/messages");

    // Socket auth middleware — validates Bearer token in handshake
    msgNs.use((socket, next) => {
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

    msgNs.on("connection", (socket) => {
        console.log(`[MessageSocket] User ${socket.user?.userId} connected — socket ${socket.id}`);

        // Client joins event room: { eventId }
        socket.on("join:event", ({ eventId }) => {
            if (!eventId) return;
            socket.join(`event:${eventId}`);
            console.log(`[MessageSocket] Socket ${socket.id} joined event:${eventId}`);
        });

        // Client leaves event room
        socket.on("leave:event", ({ eventId }) => {
            socket.leave(`event:${eventId}`);
        });

        // Client sends a message: { eventId, content }
        socket.on("message:send", async ({ eventId, content }) => {
            try {
                if (!eventId || !content?.trim()) return;

                const message = await Message.create({
                    event: eventId,
                    sender: socket.user.userId,
                    content: content.trim()
                });

                const populated = await message.populate("sender", "fullName roles");

                // Broadcast to everyone in the room (including sender)
                msgNs.to(`event:${eventId}`).emit("message:new", populated);
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        // Client requests pin toggle: { messageId }
        socket.on("message:pin", async ({ messageId }) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) return;
                message.isPinned = !message.isPinned;
                await message.save();
                const populated = await message.populate("sender", "fullName roles");
                msgNs.to(`event:${message.event.toString()}`).emit("message:pinned", populated);
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("disconnect", () => {
            console.log(`[MessageSocket] Socket ${socket.id} disconnected`);
        });
    });

    return msgNs;
};

module.exports = initMessageSocket;
