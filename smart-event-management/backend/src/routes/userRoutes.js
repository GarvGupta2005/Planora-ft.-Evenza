const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const { updateProfileValidator, changePasswordValidator } = require("../validators/userValidator");
const { ROLES } = require("../config/constants");

// ── Authenticated user's own profile ─────────────────────────────────────────

// GET /api/users/me
router.get("/me", authMiddleware, userController.getMe);

// PATCH /api/users/me — update fullName
router.patch(
    "/me",
    authMiddleware,
    updateProfileValidator,
    validateMiddleware,
    userController.updateMe
);

// POST /api/users/me/avatar — upload avatar image (multipart/form-data, field: avatar)
router.post(
    "/me/avatar",
    authMiddleware,
    userController.uploadAvatar,   // multer middleware handles file parsing
    userController.updateAvatar
);

// PATCH /api/users/me/password — change password
router.patch(
    "/me/password",
    authMiddleware,
    changePasswordValidator,
    validateMiddleware,
    userController.changePassword
);

// ── Admin-only routes ─────────────────────────────────────────────────────────

// GET /api/users — list all users (admin only)
router.get(
    "/",
    authMiddleware,
    roleMiddleware(ROLES.ADMIN),
    userController.getAllUsers
);

// GET /api/users/:id — get a user by id (admin or organizer)
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(ROLES.ADMIN, ROLES.ORGANIZER),
    userController.getUserById
);

// DELETE /api/users/:id — soft-delete / deactivate a user (admin only)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(ROLES.ADMIN),
    userController.deactivateUser
);

module.exports = router;
