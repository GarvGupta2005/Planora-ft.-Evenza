const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");

const signup = asyncHandler(async (req, res) => {
    const result = await authService.signup(req.body);
    return sendResponse(res, 201, "User registered successfully", result);
});

const signin = asyncHandler(async (req, res) => {
    const result = await authService.signin(req.body);
    return sendResponse(res, 200, "User signed in successfully", result);
});

const logout = asyncHandler(async (req, res) => {
    return sendResponse(res, 200, "User logged out successfully");
});

module.exports = {
    signup,
    signin,
    logout
};