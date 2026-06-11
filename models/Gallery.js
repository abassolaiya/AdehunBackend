const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: {
    type: String,
    required: true,
  },
  cloudinaryId: String,
  category: {
    type: String,
    enum: ["campaign", "events", "meetings", "community", "personal"],
    default: "campaign",
  },
  featured: {
    type: Boolean,
    default: false,
  },
  uploadedBy: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Gallery", gallerySchema);
