const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
  },
  { versionKey: false }
);

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
