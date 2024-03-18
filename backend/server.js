const mongoose = require("mongoose");
const express = require("express");
const chats = require("./data/data");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const MesgRouter = require("./controllers/fileController");
const cors = require("cors");
const bodyParser = require("body-parser");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the desired upload path
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original filename
  },
});

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

app.get("/", (req, res) => {
  res.send("App is runing... ");
});

app.use("/api", MesgRouter);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

// MongoDB connection URI
const uri = "mongodb://localhost:27017/Chat-app";

// Connect to MongoDB
mongoose.connect(uri);

// Get the default connection
const db = mongoose.connection;

// Event listeners for MongoDB connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

const PORT = 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    try {
      const { chat, sender, content, filename } = newMessageReceived;

      console.log("Inside new message emit function");
      console.log(newMessageReceived);

      if (!chat || !chat.users || !sender || !sender._id) {
        console.log("Inside error function");
        console.log(chat.users);
        console.log(sender._id);
        throw new Error("Invalid chat, sender, or sender._id not defined");
      }

      chat.users.forEach((user) => {
        if (user._id === sender._id) return;

        const messageToEmit = {
          chat,
          sender,
          content,
          filename,
        };

        console.log("New message emitted:", messageToEmit.filename);

        socket.to(user._id).emit("message received", messageToEmit);
      });
    } catch (error) {
      console.error("Error handling new message:", error);
    }
  });

  // --------------- with file sharing --------------------
  // socket.on("new message", (newMessageReceived) => {
  //   try {
  //     const { chat, sender, content, file } = newMessageReceived;

  //     if (!chat.users) throw new Error("chat.users not defined");

  //     chat.users.forEach((user) => {
  //       if (user._id === sender._id) return;

  //       const messageToEmit = {
  //         chat,
  //         sender,
  //         content,
  //         fileName: file ? file.filename : null,
  //       };

  //       console.log("New message emitted" + messageToEmit.fileName);

  //       if (file) {
  //         messageToEmit.file = file;
  //       }

  //       socket.to(user._id).emit("message recieved", messageToEmit);
  //     });
  //   } catch (error) {
  //     console.error("Error handling new message:", error);
  //   }
  // });

  // ----------------- New Message without file sharing --------------------

  // socket.on("new message", (newMessageRecieved) => {
  //   var chat = newMessageRecieved.chat;

  //   if (!chat.users) return console.log("chat.users not defined");

  //   chat.users.forEach((user) => {
  //     if (user._id == newMessageRecieved.sender._id) return;

  //     socket.in(user._id).emit("message recieved", newMessageRecieved);
  //   });
  // });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
