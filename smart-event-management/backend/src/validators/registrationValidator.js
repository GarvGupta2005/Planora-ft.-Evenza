const { body } = require("express-validator");

const registerForEventValidator = [
    body("role")
        .optional()
        .isIn(["participant", "volunteer"])
        .withMessage("Role must be 'participant' or 'volunteer'")
];

module.exports = { registerForEventValidator };
