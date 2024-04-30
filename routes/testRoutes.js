const express = require("express");
const router = express.Router();
const testController = require("../controllers/testControllers");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/",requireAuth(['administrator']), testController.testList);

router.post("/", testController.testCreatePost);

router.get("/create", requireAuth(['administrator']), testController.testCreateGet);

router.get("/:id",requireAuth(['administrator']), testController.testDetails);

router.delete("/:id", testController.testDelete);

// Route pour l'iframe preview test
router.get("/wtipiTests/:codeIDtest", requireAuth(['administrator']), testController.testDisplay);


module.exports = router;
