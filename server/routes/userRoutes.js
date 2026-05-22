import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

const requiredFields = [
  "name",
  "phone",
  "line1",
  "city",
  "state",
  "postalCode",
  "country",
];

const validateAddress = (address) => {
  for (const field of requiredFields) {
    if (!address[field] || !address[field].toString().trim()) {
      return `${field} is required`;
    }
  }
  return null;
};

// @route   GET /api/users/addresses
// @desc    Get saved addresses
// @access  Private
router.get("/addresses", protect, async (req, res) => {
  res.json(req.user.addresses || []);
});

// @route   POST /api/users/addresses
// @desc    Add a new address
// @access  Private
router.post("/addresses", protect, async (req, res) => {
  try {
    const error = validateAddress(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFirst = user.addresses.length === 0;
    const isDefault = isFirst || Boolean(req.body.isDefault);

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      label: req.body.label?.trim() || "",
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      line1: req.body.line1.trim(),
      line2: req.body.line2?.trim() || "",
      city: req.body.city.trim(),
      state: req.body.state.trim(),
      postalCode: req.body.postalCode.trim(),
      country: req.body.country.trim(),
      isDefault,
    });

    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ message: "Failed to add address" });
  }
});

// @route   PUT /api/users/addresses/:id
// @desc    Update an address
// @access  Private
router.put("/addresses/:id", protect, async (req, res) => {
  try {
    const error = validateAddress(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const isDefault = Boolean(req.body.isDefault);
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.label = req.body.label?.trim() || "";
    address.name = req.body.name.trim();
    address.phone = req.body.phone.trim();
    address.line1 = req.body.line1.trim();
    address.line2 = req.body.line2?.trim() || "";
    address.city = req.body.city.trim();
    address.state = req.body.state.trim();
    address.postalCode = req.body.postalCode.trim();
    address.country = req.body.country.trim();
    address.isDefault = isDefault || address.isDefault;

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Failed to update address" });
  }
});

// @route   DELETE /api/users/addresses/:id
// @desc    Delete an address
// @access  Private
router.delete("/addresses/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Failed to delete address" });
  }
});

// @route   PUT /api/users/addresses/:id/default
// @desc    Set default address
// @access  Private
router.put("/addresses/:id/default", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    address.isDefault = true;

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({ message: "Failed to set default address" });
  }
});

export default router;
