const express = require("express");
const router = express.Router();
const publicationController = require("../controllers/publicationControllers");
const { requireAuth } = require("../middleware/authMiddleware");
//const { requireStudentInPublication } = require('../middleware/authMiddleware'); 



router.get("/", publicationController.publicationList);

router.post("/", requireAuth(['administrator']), publicationController.publicationCreatePost);

router.get("/create", requireAuth(['administrator']), publicationController.publicationCreateGet);

router.get("/:id",requireAuth(['administrator']), publicationController.publicationDetails);

router.delete("/:id", publicationController.publicationDelete);

router.get("/:id/students", requireAuth(['administrator']), publicationController.studentList);

// Route qui gère la création d'une publication
router.post('/create-publication', publicationController.createPublication);

// Students acces to specific test
//router.get('/wtipiPubs/:testId', requireAuth, requireStudentInPublication, publicationController.pubTestDisplay);
//Students results treatment
//router.post('/wtipiPubs/:publicationId/submit', requireAuth, requireStudentInPublication, publicationController.submitAnswers);

module.exports = router;
