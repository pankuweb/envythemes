const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    otp: {
      type: Number,
    },
    expiryotp: {
      type: Date,
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
  },
  { versionKey: false }
);

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;
