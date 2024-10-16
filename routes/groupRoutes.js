const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupControllers");
const publicationController = require("../controllers/publicationControllers");
const { requireAuth } = require("../middleware/authMiddleware");
//const { requireAdmin } = require("../middleware/authMiddleware");

router.get("/",requireAuth(['administrator']), groupController.groupList);

router.post("/",requireAuth(['administrator']),  groupController.groupCreatePost);

router.get("/create", requireAuth(['administrator']),  groupController.groupCreateGet);

router.get("/:id",requireAuth(['administrator']),  groupController.groupDetails);

router.delete("/:id", groupController.groupDelete);

router.get("/:id/students", requireAuth(['administrator']),  groupController.studentList);



module.exports = router;
