const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const routes = require("./routes");
const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Parse comma-separated allowed origins from .env
const allowedOrigins = (process.env.CLIENT_URL || "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. Postman, curl, mobile)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            callback(new Error(`CORS: origin ${origin} not allowed`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Explicitly handle preflight for all routes
app.options("*", cors());

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Smart Event Management Backend API is running"
    });
});

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;