const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Property = require("../models/Property");
const { ensureAuth } = require("../middleware/authMiddleware");

// =====================
// DASHBOARD ROUTE
// =====================
router.get("/", ensureAuth, async (req, res) => {
  try {
    let bookings = [];
    let properties = [];

    // =====================
    // TENANT DASHBOARD
    // =====================
    if (req.user.role === "tenant") {
      bookings = await Booking.find({ tenant: req.user._id })
        .populate({
          path: "property",
          populate: { path: "owner", select: "name _id email" },
        })
        .sort({ createdAt: -1 });

      // Remove bookings with deleted properties
      bookings = bookings.filter((b) => b.property);
    }

    // =====================
    // OWNER DASHBOARD
    // =====================
    if (req.user.role === "owner") {
      // Properties owned by this owner
      properties = await Property.find({ owner: req.user._id })
        .populate("owner", "name _id email")
        .sort({ createdAt: -1 });

      // Bookings for this owner's properties
      const allBookings = await Booking.find()
        .populate({
          path: "property",
          populate: { path: "owner", select: "name _id email" },
        })
        .populate("tenant", "name email")
        .sort({ createdAt: -1 });

      bookings = allBookings.filter(
        (b) => b.property && b.property.owner && b.property.owner._id.toString() === req.user._id.toString()
      );
    }

    res.render("dashboard", {
      user: req.user,
      bookings,
      properties,
      success: req.query.success || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Dashboard Server Error");
  }
});

module.exports = router;