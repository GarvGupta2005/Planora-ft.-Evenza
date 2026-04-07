const express = require("express");
const authController = require("../controllers/authController");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
    signupValidator,
    signinValidator
} = require("../validators/authValidator");

const router = express.Router();

router.post("/signup", signupValidator, validateMiddleware, authController.signup);
router.post("/signin", signinValidator, validateMiddleware, authController.signin);
router.post("/logout", authController.logout);

module.exports = router;