const express = require("express");
const router = express.Router();
const publicationController = require("../controllers/publicationControllers");
const { requireAuth } = require("../middleware/authMiddleware");


router.get("/", publicationController.publicationList);

router.post("/", requireAuth, publicationController.publicationCreatePost);

router.get("/create", requireAuth, publicationController.publicationCreateGet);

router.get("/:id",requireAuth, publicationController.publicationDetails);

router.delete("/:id", publicationController.publicationDelete);

router.get("/:id/students", requireAuth, publicationController.studentList);

// Route qui gère la création d'une publication
router.post('/create-publication', publicationController.createPublication);

module.exports = router;
