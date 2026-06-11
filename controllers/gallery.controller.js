const Gallery = require("../models/Gallery");
const cloudinary = require("../config/cloudinary");
const { validationResult } = require("express-validator");

// @desc    Upload image to gallery
// @route   POST /api/gallery
// @access  Private/Admin
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "agbaje-campaign/gallery",
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
    });

    const imageData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      featured: req.body.featured === "true",
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedBy: req.user.id,
    };

    const image = await Gallery.create(imageData);

    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
exports.getAllImages = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, featured } = req.query;

    let query = {};
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === "true";

    const images = await Gallery.find(query)
      .sort({ featured: -1, uploadedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Gallery.countDocuments(query);

    res.json({
      success: true,
      data: images,
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

// @desc    Get single image
// @route   GET /api/gallery/:id
// @access  Public
exports.getImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update image details
// @route   PUT /api/gallery/:id
// @access  Private/Admin
exports.updateImage = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
exports.deleteImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Delete from Cloudinary
    if (image.cloudinaryId) {
      await cloudinary.uploader.destroy(image.cloudinaryId);
    }

    await image.deleteOne();

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Set featured image
// @route   PATCH /api/gallery/:id/featured
// @access  Private/Admin
exports.setFeatured = async (req, res) => {
  try {
    // Remove featured flag from all images
    await Gallery.updateMany({}, { featured: false });

    // Set new featured image
    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      { featured: true },
      { new: true },
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
