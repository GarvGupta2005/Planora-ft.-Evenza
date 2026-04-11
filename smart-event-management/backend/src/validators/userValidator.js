const { body } = require("express-validator");

const updateProfileValidator = [
    body("fullName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Full name cannot be empty")
        .isLength({ max: 100 })
        .withMessage("Full name must not exceed 100 characters")
];

const changePasswordValidator = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters")
];

module.exports = { updateProfileValidator, changePasswordValidator };
