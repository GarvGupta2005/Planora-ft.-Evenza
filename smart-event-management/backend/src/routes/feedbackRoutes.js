const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const { submitFeedbackValidator } = require("../validators/feedbackValidator");

// All routes require authentication
router.use(authMiddleware);

// GET /api/feedback/my — get current user's submitted feedback
router.get("/my", feedbackController.getMyFeedback);

// GET /api/feedback/organizer — get all feedback for organizer events
router.get("/organizer", feedbackController.getOrganizerFeedback);

// POST /api/feedback/:eventId — submit feedback
router.post(
    "/:eventId",
    submitFeedbackValidator,
    validateMiddleware,
    feedbackController.submitFeedback
);

// GET /api/feedback/:eventId — get all feedback + stats
router.get("/:eventId", feedbackController.getEventFeedback);

// GET /api/feedback/:eventId/stats — aggregate stats only
router.get("/:eventId/stats", feedbackController.getFeedbackStats);

// GET /api/feedback/:eventId/trends — rating trend over time (chart data)
router.get("/:eventId/trends", feedbackController.getFeedbackTrends);

// DELETE /api/feedback/:feedbackId — delete a feedback entry
router.delete("/:feedbackId", feedbackController.deleteFeedback);

module.exports = router;
