// middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");

// =====================
// STORAGE CONFIGURATION
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Append timestamp to avoid filename conflicts
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// =====================
// FILE FILTER (ONLY IMAGES)
// =====================
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// =====================
// UPLOAD MIDDLEWARE
// =====================
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
  fileFilter,
});

module.exports = upload;