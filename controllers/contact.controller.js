const Contact = require("../models/Contact");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contact = await Contact.create(req.body);

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Message from ${req.body.name}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${req.body.name}</p>
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>Phone:</strong> ${req.body.phone || "Not provided"}</p>
        <p><strong>Subject:</strong> ${req.body.subject || "No subject"}</p>
        <p><strong>Message:</strong></p>
        <p>${req.body.message}</p>
      `,
    };

    // await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Submit contact error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = {};
    if (status) query.status = status;

    const messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: messages,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single message
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Mark as read if not already
    if (message.status === "unread") {
      message.status = "read";
      await message.save();
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Get message error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update message status
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status, reply } = req.body;

    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, reply },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Send reply email if provided
    if (reply && message.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: message.email,
        subject: `Re: ${message.subject || "Your message to Barr. Akeem Agbaje"}`,
        html: `
          <h3>Thank you for reaching out</h3>
          <p>Dear ${message.name},</p>
          <p>${reply}</p>
          <br>
          <p>Best regards,</p>
          <p>Barr. Akeem Agbaje Campaign Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Update message error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private/Admin
exports.getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const unread = await Contact.countDocuments({ status: "unread" });
    const byDate = await Contact.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    res.json({
      success: true,
      data: {
        total,
        unread,
        byDate,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
