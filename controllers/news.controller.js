const News = require("../models/News");
const { validationResult } = require("express-validator");
const slugify = require("slugify");

// @desc    Create news article
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate slug from title
    const slug = slugify(req.body.title, { lower: true, strict: true });
    req.body.slug = slug;

    const news = new News(req.body);
    await news.save();

    res.status(201).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all news articles
// @route   GET /api/news
// @access  Public
exports.getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, published } = req.query;

    let query = {};
    if (category) query.category = category;
    if (published !== undefined) query.published = published === "true";

    const news = await News.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await News.countDocuments(query);

    res.json({
      success: true,
      data: news,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single news article
// @route   GET /api/news/:slug
// @access  Public
exports.getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    // Increment views
    news.views += 1;
    await news.save();

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = async (req, res) => {
  try {
    let news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    // Update slug if title changed
    if (req.body.title && req.body.title !== news.title) {
      req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    }

    news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    res.json({
      success: true,
      message: "News article deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Publish/unpublish news
// @route   PATCH /api/news/:id/publish
// @access  Private/Admin
exports.publishNews = async (req, res) => {
  try {
    const { published } = req.body;
    const updateData = { published };

    if (published) {
      updateData.publishedAt = new Date();
    }

    const news = await News.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
