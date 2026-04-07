const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d"
        }
    );
};

const signup = async ({ fullName, email, password }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        const error = new Error("User already exists");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.create({
        fullName,
        email,
        password
    });

    const token = generateToken(user);

    return {
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email
        },
        token
    };
};

const signin = async ({ email, password }) => {
    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user);

    return {
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email
        },
        token
    };
};

module.exports = {
    signup,
    signin
};