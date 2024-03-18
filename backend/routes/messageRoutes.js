const express = require("express");
const {
  allMessages,
  sendMessage,
  downlodFile,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/file/:fileId").get(protect, downlodFile);


module.exports = router;
