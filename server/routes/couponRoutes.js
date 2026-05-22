import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Coupon from "../models/Coupon.js";

const router = express.Router();

const calculateDiscount = (coupon, subtotal) => {
  if (coupon.type === "percent") {
    return Math.round((subtotal * coupon.amount) / 100);
  }
  return coupon.amount;
};

// @route   POST /api/coupons/validate
// @desc    Validate coupon code
// @access  Private
router.post("/validate", protect, async (req, res) => {
  try {
    const code = req.body.code?.toString().trim().toUpperCase();
    const subtotal = Number(req.body.subtotal || 0);

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    if (Number.isNaN(subtotal) || subtotal <= 0) {
      return res.status(400).json({ message: "Invalid subtotal" });
    }

    const coupon = await Coupon.findOne({ code, active: true });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid or inactive coupon" });
    }

    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      return res.status(400).json({
        message: `Minimum order amount is ${coupon.minSubtotal}`,
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    const discount = Math.min(calculateDiscount(coupon, subtotal), subtotal);

    res.json({
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount,
      discount,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({ message: "Failed to validate coupon" });
  }
});

export default router;
