// controllers/propertyController.js
const Property = require("../models/Property");

// =====================
// ADD PROPERTY
// =====================
exports.addProperty = async (req, res) => {
  try {
    const { title, description, price, location, ownerContact } = req.body;
    const image = req.file ? req.file.filename : "";

    const property = await Property.create({
      title,
      description,
      price,
      location,
      ownerContact,
      image,
      owner: req.user._id,
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding property");
  }
};

// =====================
// EDIT PROPERTY
// =====================
exports.editProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) return res.status(404).send("Property not found");

    // Only owner can edit
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send("Not authorized to edit this property");
    }

    // Update fields
    property.title = req.body.title || property.title;
    property.description = req.body.description || property.description;
    property.price = req.body.price || property.price;
    property.location = req.body.location || property.location;
    property.ownerContact = req.body.ownerContact || property.ownerContact;

    // Update image if uploaded
    if (req.file) property.image = req.file.filename;

    await property.save();

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing property");
  }
};

// =====================
// DELETE PROPERTY
// =====================
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) return res.status(404).send("Property not found");

    // Only owner can delete
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send("Not authorized to delete this property");
    }

    await property.deleteOne();

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting property");
  }
};