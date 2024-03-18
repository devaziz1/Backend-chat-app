const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const File = require("../models/files");

const multer = require("multer");
const express = require("express");
const router = express.Router();
const app = express();
const mongoose = require("mongoose");
const {
  Types: { ObjectId },
} = mongoose;
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected

const sendMessage = asyncHandler(async (req, res) => {
  console.log("Inside send message API");
  const { content, chatId, file, filename } = req.body;
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const fileId = new ObjectId();

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    file: fileId,
    filename: filename,
  };

  try {
    if (file) {
     
      await File.create({
        _id: fileId,
        file: Buffer.from(file, "base64"),
        filename,
      });
    }
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Download file
//@route           GET /api/message/file/:id
//@access          Protected

const downlodFile = asyncHandler(async (req, res) => {
  console.log("Download file");
  const { fileId } = req.params;
  console.log("Inside file: " + fileId);

  try {
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.set("Content-Type", "application/octet-stream");
    res.set("Content-Disposition", `attachment; filename="${file.filename}"`);
    res.send(file.file);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = { allMessages, sendMessage, downlodFile };
