const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: String,
  attending: {
    type: Boolean,
    default: true,
  },
  rsvpDate: {
    type: Date,
    default: Date.now,
  },
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  venueMap: String,
  type: {
    type: String,
    enum: ["rally", "meeting", "workshop", "fundraiser", "other"],
    default: "meeting",
  },
  featuredImage: String,
  capacity: Number,
  rsvps: [rsvpSchema],
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Event", eventSchema);
