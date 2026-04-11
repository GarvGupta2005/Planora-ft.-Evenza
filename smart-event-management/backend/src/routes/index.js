const express = require("express");
const authRoutes = require("./authRoutes");
const eventRoutes = require("./eventRoutes");
const registrationRoutes = require("./registrationRoutes");
const codeRoutes = require("./codeRoutes");
const attendanceRoutes = require("./attendanceRoutes");
const feedbackRoutes = require("./feedbackRoutes");
const volunteerRoutes = require("./volunteerRoutes");
const certificateRoutes = require("./certificateRoutes");
const messageRoutes = require("./messageRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const userRoutes = require("./userRoutes");

const notificationRoutes = require("./notificationRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/registrations", registrationRoutes);
router.use("/codes", codeRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/volunteers", volunteerRoutes);
router.use("/certificates", certificateRoutes);
router.use("/messages", messageRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;