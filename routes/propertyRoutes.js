// routes/propertyRoutes.js
const express = require("express");
const router = express.Router();

const { addProperty, editProperty, deleteProperty } = require("../controllers/propertyController");
const { ensureAuth, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// =====================
// ADD PROPERTY (owner only)
// =====================
router.post("/add", ensureAuth, authorize("owner"), upload.single("image"), addProperty);

// =====================
// EDIT PROPERTY (owner only)
// =====================
router.post("/edit/:id", ensureAuth, authorize("owner"), upload.single("image"), editProperty);

// =====================
// DELETE PROPERTY (owner only)
// =====================
router.post("/delete/:id", ensureAuth, authorize("owner"), deleteProperty);

module.exports = router;