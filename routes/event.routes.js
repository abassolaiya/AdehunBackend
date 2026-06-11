const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const eventController = require("../controllers/event.controller");
const { protect, authorize } = require("../middleware/auth");

// Validation rules
const eventValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("eventDate").isISO8601().withMessage("Valid event date is required"),
  body("venue").notEmpty().withMessage("Venue is required"),
  body("type")
    .isIn(["rally", "meeting", "workshop", "fundraiser", "other"])
    .withMessage("Invalid event type"),
];

const rsvpValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
];

// Public routes
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEvent);
router.post("/:id/rsvp", rsvpValidation, eventController.rsvpEvent);

// Protected routes
router.post(
  "/",
  protect,
  authorize("admin", "editor"),
  eventValidation,
  eventController.createEvent,
);
router.put(
  "/:id",
  protect,
  authorize("admin", "editor"),
  eventController.updateEvent,
);
router.delete("/:id", protect, authorize("admin"), eventController.deleteEvent);

module.exports = router;
