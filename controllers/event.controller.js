const Event = require("../models/Event");
const { validationResult } = require("express-validator");

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = new Event(req.body);
    await event.save();

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, upcoming = "true" } = req.query;

    let query = {};
    if (type) query.type = type;

    if (upcoming === "true") {
      query.eventDate = { $gte: new Date() };
      query.status = "upcoming";
    }

    const events = await Event.find(query)
      .sort({ eventDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all events error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    RSVP for event
// @route   POST /api/events/:id/rsvp
// @access  Public
exports.rsvpEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if already RSVP'd
    const alreadyRSVP = event.rsvps.some(
      (rsvp) => rsvp.email === req.body.email,
    );

    if (alreadyRSVP) {
      return res.status(400).json({
        success: false,
        message: "You have already RSVP'd for this event",
      });
    }

    event.rsvps.push({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      attending: req.body.attending !== false,
      rsvpDate: new Date(),
    });

    await event.save();

    res.json({
      success: true,
      message: "RSVP submitted successfully",
      data: event,
    });
  } catch (error) {
    console.error("RSVP event error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
