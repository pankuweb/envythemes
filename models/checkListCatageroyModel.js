const mongoose = require("mongoose");

const checkListParentSchema = new mongoose.Schema(
  {
    sign1: {
      type: String,
    },
    sign2: {
      type: String,
    },
    sign3: {
      type: String,
    },
    sign4: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const checkListParent = mongoose.model(
  "checkListParent",
  checkListParentSchema
);

module.exports = checkListParent;
