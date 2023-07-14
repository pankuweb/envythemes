const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
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
  },
  { versionKey: false }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

module.exports = Vehicle;
