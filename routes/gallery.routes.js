const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const {
  uploadImage,
  getAllImages,
  getImage,
  updateImage,
  deleteImage,
  setFeatured,
} = require("../controllers/gallery.controller");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getAllImages);
router.get("/:id", getImage);

// Protected routes
router.post(
  "/",
  protect,
  authorize("admin", "editor"),
  upload.single("image"),
  uploadImage,
);
router.put("/:id", protect, authorize("admin", "editor"), updateImage);
router.patch("/:id/featured", protect, authorize("admin"), setFeatured);
router.delete("/:id", protect, authorize("admin"), deleteImage);

module.exports = router;
