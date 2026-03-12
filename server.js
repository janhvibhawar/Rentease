// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const User = require("./models/User");
const Property = require("./models/Property");

dotenv.config();
connectDB();

const app = express();

// =====================
// SESSIONS
// =====================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rentease_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(methodOverride("_method"));

// =====================
// STATIC FOLDERS
// =====================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// =====================
// VIEW ENGINE
// =====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =====================
// GET USER FROM TOKEN OR SESSION
// =====================
const getUserFromRequest = async (req) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId).select("-password");
      return user || null;
    }

    if (req.cookies.token) {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      return user || null;
    }

    return null;
  } catch (err) {
    console.log("Invalid token/session");
    return null;
  }
};

// =====================
// GLOBAL USER MIDDLEWARE
// =====================
app.use(async (req, res, next) => {
  req.user = await getUserFromRequest(req);
  res.locals.user = req.user; // available in EJS
  next();
});

// =====================
// ROUTES
// =====================

// Auth routes
app.use("/", authRoutes);

// Booking routes
app.use("/api/bookings", bookingRoutes);

// Property routes
app.use("/api/properties", propertyRoutes);

// Dashboard route
app.use("/dashboard", dashboardRoutes);

// =====================
// USER-FACING PAGES
// =====================

// Home page
app.get("/", async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "name email");
    res.render("home", { properties });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Login/Register pages
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));

// Add property page
app.get("/properties/add", (req, res) => res.render("properties/add-property"));

// View all properties
app.get("/properties", async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "name email");
    res.render("properties/index", { properties });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Search properties
app.get("/properties/search", async (req, res) => {
  const { location } = req.query;
  try {
    const properties = await Property.find({
      location: { $regex: location, $options: "i" },
    }).populate("owner", "name email");

    res.render("properties/index", { properties });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// View single property
app.get("/properties/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send("Invalid property ID");

  try {
    const property = await Property.findById(req.params.id).populate("owner", "name email");
    if (!property) return res.status(404).send("Property not found");

    res.render("properties/show", { property });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));