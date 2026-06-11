const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: String,
  lga: {
    type: String,
    required: true,
  },
  ward: String,
  pollingUnit: String,
  skills: [String],
  availability: {
    type: String,
    enum: ["full-time", "part-time", "weekends", "flexible"],
    default: "flexible",
  },
  interests: [
    {
      type: String,
      enum: [
        "campaign activities",
        "community outreach",
        "event organization",
        "digital media",
        "fundraising",
        "administrative support",
      ],
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "active", "inactive"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Volunteer", volunteerSchema);
