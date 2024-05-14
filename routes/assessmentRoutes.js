const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireStudentInPublication } = require("../middleware/authMiddleware");

router.get("/index", requireAuth(['student']),assessmentController.assessmentList);

//router.get("/wtipiPubs/:publicationCode", requireAuth(['student']),  assessmentController.serveAssessment);

router.get("/wtipiPubs/:publicationCode", requireAuth(['student']), (req, res, next) => {
    console.log("Route /wtipiPubs/:publicationCode atteinte");
    next();
}, assessmentController.serveAssessment);







module.exports = router;
