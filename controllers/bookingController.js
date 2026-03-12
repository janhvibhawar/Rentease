// controllers/bookingController.js
const Booking = require("../models/Booking");
const Property = require("../models/Property");

// =====================
// CREATE BOOKING
// =====================
exports.createBooking = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) return res.status(404).send("Property not found");

    // Prevent booking own property
    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).send("Cannot book your own property");
    }

    // Prevent booking if already booked
    if (property.status === "booked") {
      return res.redirect("/properties");
    }

    // Check if tenant already booked
    const existingBooking = await Booking.findOne({
      property: property._id,
      tenant: req.user._id,
    });

    if (existingBooking) {
      return res.redirect("/dashboard");
    }

    // Create booking request
    await Booking.create({
      property: property._id,
      tenant: req.user._id,
      status: "pending",
    });

    res.redirect("/dashboard");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while booking property");
  }
};


// =====================
// UPDATE BOOKING STATUS
// =====================
exports.updateBookingStatus = async (req, res) => {
  try {

    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId).populate("property");

    if (!booking) return res.status(404).send("Booking not found");

    // Only property owner can update
    if (booking.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send("Not authorized");
    }

    booking.status = status;
    await booking.save();

    // Update property status
    const property = await Property.findById(booking.property._id);

    if (status === "confirmed") {
      property.status = "booked";
    }

    if (status === "cancelled") {
      property.status = "available";
    }

    await property.save();

    res.redirect("/dashboard");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating booking status");
  }
};