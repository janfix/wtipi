const express = require("express");
const router = express.Router();
const testController = require("../controllers/testControllers");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", testController.testList);

router.post("/", testController.testCreatePost);

router.get("/create", requireAuth, testController.testCreateGet);

router.get("/:id",requireAuth, testController.testDetails);

router.delete("/:id", testController.testDelete);


module.exports = router;
