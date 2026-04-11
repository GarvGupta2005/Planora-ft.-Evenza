const { body } = require("express-validator");

const submitFeedbackValidator = [
    body("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5"),
    body("comments")
        .optional()
        .isString()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Comments must not exceed 1000 characters"),
    body("metrics.venue")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Venue rating must be between 1 and 5"),
    body("metrics.content")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Content rating must be between 1 and 5"),
    body("metrics.organization")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Organization rating must be between 1 and 5")
];

module.exports = { submitFeedbackValidator };
