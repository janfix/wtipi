const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogControllers");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", blogController.blogList);

router.post("/", blogController.blogCreatePost);

router.get("/create", requireAuth, blogController.blogCreateGet);

router.get("/:id", blogController.blogDetails);

router.delete("/:id", blogController.blogDelete);

module.exports = router;
