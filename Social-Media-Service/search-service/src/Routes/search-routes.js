const express = require("express");
const { searchPostController } = require("../controllers/search-controller");
const { authenticated } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticated);

router.get("/posts", searchPostController);

module.exports = router;