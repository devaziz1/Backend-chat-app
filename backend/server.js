const mongoose = require("mongoose");
const express = require("express");
const chats = require("./data/data");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes")
const { notFound, errorHandler } = require("./middleware/errorMiddleware");


const app = express();
dotenv.config();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("App is runing... ");
});

app.use("/api/user", userRoutes);

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



const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server listening on port... ${PORT}`));
