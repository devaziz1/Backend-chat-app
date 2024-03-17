const mongoose = require("mongoose");

const fileModel = mongoose.Schema({
  file: {
    type: Buffer,
  },
  filename: {
    type: String,
  },
});

const file = mongoose.model("File", fileModel);

module.exports = file;
