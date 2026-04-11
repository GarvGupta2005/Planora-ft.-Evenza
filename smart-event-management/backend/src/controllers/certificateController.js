const certificateService = require("../services/certificateService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/response");

/**
 * POST /api/certificates/:eventId/issue
 * Issue a certificate for a user (organizer initiates for a participant/volunteer).
 * Body: { userId, type }
 */
const issueCertificate = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { userId, type } = req.body;

    const certificate = await certificateService.issueCertificate(userId, eventId, type);
    return sendResponse(res, 201, "Certificate issued successfully", certificate);
});

/**
 * GET /api/certificates/my
 * Get all certificates for the authenticated user.
 */
const getMyCertificates = asyncHandler(async (req, res) => {
    const certificates = await certificateService.getMyCertificates(req.user.userId);
    return sendResponse(res, 200, "Certificates fetched successfully", certificates);
});

/**
 * GET /api/certificates/verify/:certificateId
 * Public endpoint — verify a certificate by its unique certificateId string.
 */
const verifyCertificate = asyncHandler(async (req, res) => {
    const { certificateId } = req.params;
    const certificate = await certificateService.verifyCertificate(certificateId);
    return sendResponse(res, 200, "Certificate is valid", certificate);
});

/**
 * GET /api/certificates/event/:eventId
 * Get all certificates issued for an event (organizer view).
 */
const getCertificatesByEvent = asyncHandler(async (req, res) => {
    const certificates = await certificateService.getCertificatesByEvent(req.params.eventId);
    return sendResponse(res, 200, "Event certificates fetched", certificates);
});

module.exports = {
    issueCertificate,
    getMyCertificates,
    verifyCertificate,
    getCertificatesByEvent
};
