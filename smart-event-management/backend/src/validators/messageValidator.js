const { body } = require("express-validator");

const sendMessageValidator = [
    body("content")
        .trim()
        .notEmpty()
        .withMessage("Message content is required")
        .isLength({ max: 2000 })
        .withMessage("Message content must not exceed 2000 characters")
];

module.exports = { sendMessageValidator };
