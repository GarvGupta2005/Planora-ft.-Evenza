const crypto = require("crypto");

/**
 * Generates a URL-safe unique certificate verification ID.
 * Format: CERT-<timestamp>-<8 random hex chars>
 */
const generateCertificateId = () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `CERT-${ts}-${rand}`;
};

/**
 * Generates a short alphanumeric join code for events.
 * Same style as eventService already does inline.
 */
const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Generates a random numeric OTP of a given length.
 */
const generateOTP = (length = 6) => {
    return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
};

/**
 * Generates a unique registration code for check-ins.
 * Format: REG-<timestamp>-<4 random hex chars>
 */
const generateRegCode = () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
    return `REG-${ts}-${rand}`;
};

module.exports = {
    generateCertificateId,
    generateJoinCode,
    generateOTP,
    generateRegCode
};
