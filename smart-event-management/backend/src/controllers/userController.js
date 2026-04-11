const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── Multer Configuration ────────────────────────────────────────────────────

const uploadDir = path.join(process.cwd(), "uploads", "avatars");
// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const userId = req.user?.userId || "unknown";
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `avatar-${userId}-${Date.now()}${ext}`);
    }
});

const fileFilter = (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2 MB
});

// Export the multer middleware so routes can use it
const uploadAvatar = upload.single("avatar");

// ─── Controller Handlers ─────────────────────────────────────────────────────

/**
 * GET /api/users/me
 * Get the authenticated user's profile.
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }
    return sendResponse(res, 200, "Profile fetched", user);
});

/**
 * PATCH /api/users/me
 * Update the authenticated user's profile (fullName only — email/password have separate flows).
 * Body: { fullName }
 */
const updateMe = asyncHandler(async (req, res) => {
    const { fullName } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    if (fullName && fullName.trim()) {
        user.fullName = fullName.trim();
    }

    await user.save();
    return sendResponse(res, 200, "Profile updated", {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        avatar: user.avatar
    });
});

/**
 * POST /api/users/me/avatar
 * Upload a new avatar image for the authenticated user.
 * Multipart form-data field name: "avatar"
 */
const updateAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        const err = new Error("No image file provided");
        err.statusCode = 400;
        throw err;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    // Delete the old avatar file if it exists on disk
    if (user.avatar) {
        const oldPath = path.join(process.cwd(), user.avatar.replace(/^\//, ""));
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
    }

    // Save the relative public URL (served via /uploads static route in app.js)
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    return sendResponse(res, 200, "Avatar updated", { avatar: user.avatar });
});

/**
 * PATCH /api/users/me/password
 * Change the authenticated user's password.
 * Body: { currentPassword, newPassword }
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        const err = new Error("Current password is incorrect");
        err.statusCode = 401;
        throw err;
    }

    if (!newPassword || newPassword.length < 6) {
        const err = new Error("New password must be at least 6 characters");
        err.statusCode = 400;
        throw err;
    }

    user.password = newPassword; // bcrypt pre-save hook handles hashing
    await user.save();

    return sendResponse(res, 200, "Password changed successfully");
});

/**
 * GET /api/users/:id
 * Get a public profile of any user (admin or event context use).
 */
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }
    return sendResponse(res, 200, "User fetched", user);
});

/**
 * GET /api/users
 * List all users (Admin only).
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return sendResponse(res, 200, "Users fetched", users);
});

/**
 * DELETE /api/users/:id
 * Soft-delete / deactivate a user (Admin only).
 */
const deactivateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }
    user.isActive = false;
    await user.save();
    return sendResponse(res, 200, "User deactivated");
});

module.exports = {
    uploadAvatar,       // multer middleware — used directly in userRoutes
    getMe,
    updateMe,
    updateAvatar,
    changePassword,
    getUserById,
    getAllUsers,
    deactivateUser
};
