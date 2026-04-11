const express = require("express");
const router = express.Router();

const certificateController = require("../controllers/certificateController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { ROLES } = require("../config/constants");

// GET /api/certificates/my — authenticated user's own certificates
router.get("/my", authMiddleware, certificateController.getMyCertificates);

// GET /api/certificates/verify/:certificateId — public verification
router.get("/verify/:certificateId", certificateController.verifyCertificate);

// GET /api/certificates/event/:eventId — all certs for an event (organizer)
router.get(
    "/event/:eventId",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    certificateController.getCertificatesByEvent
);

// POST /api/certificates/:eventId/issue — issue a certificate (organizer only)
// Body: { userId, type }
router.post(
    "/:eventId/issue",
    authMiddleware,
    roleMiddleware(ROLES.ORGANIZER, ROLES.ADMIN),
    certificateController.issueCertificate
);

module.exports = router;
