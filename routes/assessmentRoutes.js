const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/index", requireAuth(['student']),assessmentController.assessmentList);


//router.get("/assessments/:id",requireAuth, assessmentController.assessmentDetails);




module.exports = router;
