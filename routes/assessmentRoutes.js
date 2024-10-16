const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");
const { requireAuth, requireAuthInPublication } = require("../middleware/authMiddleware");
const { requireStudentInPublication } = require("../middleware/authMiddleware");



//router.get("/wtipiPubs/:publicationCode", requireAuth(['student']),  assessmentController.serveAssessment);

/* router.get("/wtipiPubs/:publicationCode", requireAuth(['student']), (req, res, next) => {
    console.log("Route /wtipiPubs/:publicationCode atteinte");
    next();
}, assessmentController.serveAssessment); */

// Définir la route pour servir l'évaluation avec vérification d'authentification

router.get("/wtipiPubs/test:publicationCode", (req, res, next) => {
   
    next();
}, requireAuth(['student']), assessmentController.serveAssessment);

router.get("/index", requireAuth(['student','administrator']),assessmentController.assessmentList);




module.exports = router;
