// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();

const { createBooking, updateBookingStatus } = require("../controllers/bookingController");
const { ensureAuth, authorize } = require("../middleware/authMiddleware");

// =====================
// CREATE BOOKING (tenant only)
// =====================
router.post("/:id", ensureAuth, authorize("tenant"), createBooking);

// =====================
// UPDATE BOOKING STATUS (owner only)
// =====================
router.post("/update/status", ensureAuth, authorize("owner"), updateBookingStatus);

module.exports = router;