const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupControllers");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", groupController.groupList);

router.post("/", groupController.groupCreatePost);

router.get("/create", requireAuth, groupController.groupCreateGet);

router.get("/:id",requireAuth, groupController.groupDetails);

router.delete("/:id", groupController.groupDelete);

router.get("/:id/students", requireAuth, groupController.studentList);

module.exports = router;
