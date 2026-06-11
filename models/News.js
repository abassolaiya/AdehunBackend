const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  excerpt: String,
  content: {
    type: String,
    required: true,
  },
  featuredImage: String,
  category: {
    type: String,
    enum: ["news", "press-release", "statement", "event", "speech"],
    default: "news",
  },
  author: String,
  tags: [String],
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("News", newsSchema);
