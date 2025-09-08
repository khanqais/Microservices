const express = require("express");
const router = express.Router();
const {
  createPost,GetallPost,GetPost,DeletePost
} = require("../controllers/PostController");
const { authenticated } = require("../middleware/authMiddleware");


//middleware -> this will tell if the user is an auth user or not
router.use(authenticated);

router.post("/create-post", createPost);
router.get("/all-posts", GetallPost);
router.get("/:id", GetPost);
router.delete("/:id", DeletePost);

module.exports = router;