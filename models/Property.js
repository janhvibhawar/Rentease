// models/Property.js
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
    },

    description: {
      type: String,
      required: [true, "Property description is required"],
    },

    price: {
      type: Number,
      required: [true, "Property price is required"],
    },

    location: {
      type: String,
      required: [true, "Property location is required"],
    },

    image: {
      type: String,
      default: "",
    },

    // Owner reference
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // NEW FIELD (Contact Number)
    ownerContact: {
      type: String,
      required: [true, "Owner contact number is required"],
    },

    // Property status
    status: {
      type: String,
      enum: ["available", "booked"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);