const { body } = require("express-validator");

const assignTaskValidator = [
    body("userId")
        .notEmpty()
        .withMessage("userId is required"),
    body("taskDescription")
        .trim()
        .notEmpty()
        .withMessage("Task description is required")
        .isLength({ max: 500 })
        .withMessage("Task description must not exceed 500 characters")
];

const updateTaskStatusValidator = [
    body("status")
        .isIn(["pending", "in-progress", "completed"])
        .withMessage("Status must be 'pending', 'in-progress', or 'completed'")
];

module.exports = { assignTaskValidator, updateTaskStatusValidator };
