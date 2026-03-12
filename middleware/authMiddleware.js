// middleware/authMiddleware.js

// =====================
// CHECK IF USER IS LOGGED IN
// =====================
exports.ensureAuth = (req, res, next) => {
  if (!req.user) {
    // If request is API, send JSON; else redirect for web
    if (req.originalUrl.startsWith("/api")) {
      return res.status(401).json({ message: "Not authorized" });
    }
    return res.redirect("/login");
  }
  next();
};

// =====================
// ROLE-BASED AUTHORIZATION
// =====================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "User role not authorized" });
    }
    next();
  };
};