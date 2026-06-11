const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createNews,
  getAllNews,
  getNewsBySlug,
  updateNews,
  deleteNews,
  publishNews,
} = require("../controllers/news.controller");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../config/multer"); // import multer

// Validation rules (unchanged)
const newsValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("category")
    .isIn(["news", "press-release", "statement", "event", "speech"])
    .withMessage("Invalid category"),
];

// Public routes
router.get("/", getAllNews);
router.get("/:slug", getNewsBySlug);

// Protected routes with image upload
router.post(
  "/",
  protect,
  authorize("admin", "editor"),
  upload.single("image"), // <-- add this
  newsValidation,
  createNews,
);

router.put(
  "/:id",
  protect,
  authorize("admin", "editor"),
  upload.single("image"), // <-- add this
  updateNews,
);

router.patch(
  "/:id/publish",
  protect,
  authorize("admin", "editor"),
  publishNews,
);

router.delete("/:id", protect, authorize("admin"), deleteNews);

module.exports = router;
