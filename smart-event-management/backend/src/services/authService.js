const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ROLES } = require("../config/constants");

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            roles: user.roles || []
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d"
        }
    );
};

const signup = async ({ fullName, email, password, roles }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        const error = new Error("User already exists");
        error.statusCode = 400;
        throw error;
    }

    // Map submitted role strings to canonical cased roles
    const roleMap = {
        organizer: ROLES.ORGANIZER,
        participant: ROLES.PARTICIPANT,
        volunteer: ROLES.VOLUNTEER,
        admin: ROLES.ADMIN,
    };

    const mappedRoles = Array.isArray(roles) && roles.length > 0
        ? roles.map(r => roleMap[r.toLowerCase()] || ROLES.PARTICIPANT)
        : [ROLES.PARTICIPANT];

    const user = await User.create({
        fullName,
        email,
        password,
        roles: mappedRoles
    });

    const token = generateToken(user);

    return {
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            roles: user.roles
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
            email: user.email,
            roles: user.roles
        },
        token
    };
};

module.exports = {
    signup,
    signin
};