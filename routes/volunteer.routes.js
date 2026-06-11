const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  registerVolunteer,
  getAllVolunteers,
  getVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getVolunteerStats,
} = require("../controllers/volunteer.controller");
const { protect, authorize } = require("../middleware/auth");

// Validation rules
const volunteerValidation = [
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("lga").notEmpty().withMessage("Local Government Area is required"),
  body("availability")
    .isIn(["full-time", "part-time", "weekends", "flexible"])
    .withMessage("Invalid availability option"),
];

// Public routes
router.post("/register", volunteerValidation, registerVolunteer);

// Protected routes
router.get("/", protect, authorize("admin", "editor"), getAllVolunteers);
router.get("/stats", protect, authorize("admin"), getVolunteerStats);
router.get("/:id", protect, authorize("admin", "editor"), getVolunteer);
router.put("/:id", protect, authorize("admin", "editor"), updateVolunteer);
router.delete("/:id", protect, authorize("admin"), deleteVolunteer);

module.exports = router;
