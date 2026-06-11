const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const contactController = require("../controllers/contact.controller");
const { protect, authorize } = require("../middleware/auth");

// Validation rules
const contactValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("message").notEmpty().withMessage("Message is required"),
];

// Public routes
router.post("/", contactValidation, contactController.submitContact);

// Protected routes
router.get(
  "/",
  protect,
  authorize("admin", "editor"),
  contactController.getAllMessages,
);
router.get(
  "/stats",
  protect,
  authorize("admin"),
  contactController.getContactStats,
);
router.get(
  "/:id",
  protect,
  authorize("admin", "editor"),
  contactController.getMessage,
);
router.put(
  "/:id",
  protect,
  authorize("admin", "editor"),
  contactController.updateMessageStatus,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  contactController.deleteMessage,
);

module.exports = router;
