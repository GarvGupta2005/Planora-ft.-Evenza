const { body } = require("express-validator");

const markAttendanceValidator = [
    body("userId")
        .notEmpty()
        .withMessage("userId is required"),
    body("isPresent")
        .isBoolean()
        .withMessage("isPresent must be true or false")
];

module.exports = { markAttendanceValidator };
