// controllers/authController.js
const User = require("../models/User");

// ======================
// REGISTER
// ======================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Create user (password hashing handled in model)
    const user = await User.create({ name, email, password, role });

    // Optionally auto-login or redirect to login
    return res.redirect("/login");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

// ======================
// LOGIN
// ======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    // Generate JWT using model method
    const token = user.getSignedJwtToken();

    // Store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Store user id in session for dashboard/session-based auth
    req.session.userId = user._id;

    return res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

// ======================
// LOGOUT
// ======================
exports.logout = (req, res) => {
  res.clearCookie("token");
  req.session.destroy(() => {
    res.redirect("/login");
  });
};