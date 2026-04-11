const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const { sendMessageValidator } = require("../validators/messageValidator");
const { ROLES } = require("../config/constants");

// POST /api/messages/:eventId — send a message (any authenticated user)
router.post(
    "/:eventId",
    authMiddleware,
    sendMessageValidator,
    validateMiddleware,
    messageController.sendMessage
);

// GET /api/messages/:eventId — get all messages (paginated)
router.get("/:eventId", authMiddleware, messageController.getEventMessages);

// GET /api/messages/:eventId/pinned — get pinned messages
router.get("/:eventId/pinned", authMiddleware, messageController.getPinnedMessages);

// PATCH /api/messages/:messageId/pin — toggle pin (organizer only)
router.patch(
    "/:messageId/pin",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    messageController.togglePin
);

// DELETE /api/messages/:messageId — delete message (sender or organizer)
router.delete("/:messageId", authMiddleware, messageController.deleteMessage);

module.exports = router;
