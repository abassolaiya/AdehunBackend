const Volunteer = require("../models/Volunteer");
const { validationResult } = require("express-validator");

// @desc    Register new volunteer
// @route   POST /api/volunteers
// @access  Public
exports.registerVolunteer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log("Registering volunteer with data:", req.body);
    const volunteer = new Volunteer(req.body);
    await volunteer.save();

    res.status(201).json({
      success: true,
      message: "Volunteer registered successfully",
      data: volunteer,
    });
  } catch (error) {
    console.error("Registration error details:", error);
    // If it's a Mongoose validation error, log the errors object
    if (error.name === "ValidationError") {
      console.error("Validation errors:", error.errors);
    }
    // If duplicate key error
    if (error.code === 11000) {
      console.error("Duplicate field:", error.keyValue);
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all volunteers
// @route   GET /api/volunteers
// @access  Private/Admin
exports.getAllVolunteers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, lga } = req.query;

    let query = {};
    if (status) query.status = status;
    if (lga) query.lga = lga;

    const volunteers = await Volunteer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Volunteer.countDocuments(query);

    res.json({
      success: true,
      data: volunteers,
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

// @desc    Get single volunteer
// @route   GET /api/volunteers/:id
// @access  Private/Admin
exports.getVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    res.json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update volunteer status
// @route   PUT /api/volunteers/:id
// @access  Private/Admin
exports.updateVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    res.json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete volunteer
// @route   DELETE /api/volunteers/:id
// @access  Private/Admin
exports.deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndDelete(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    res.json({
      success: true,
      message: "Volunteer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get volunteer statistics
// @route   GET /api/volunteers/stats
// @access  Private/Admin
exports.getVolunteerStats = async (req, res) => {
  try {
    const total = await Volunteer.countDocuments();
    const byStatus = await Volunteer.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const byLGA = await Volunteer.aggregate([
      { $group: { _id: "$lga", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const byInterest = await Volunteer.aggregate([
      { $unwind: "$interests" },
      { $group: { _id: "$interests", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus,
        byLGA,
        byInterest,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
