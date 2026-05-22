import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Recipe from "../models/Recipe.js";
import Coupon from "../models/Coupon.js";

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
const calculateDiscount = (coupon, subtotal) => {
  if (coupon.type === "percent") {
    return Math.round((subtotal * coupon.amount) / 100);
  }
  return coupon.amount;
};

router.post("/", protect, async (req, res) => {
  try {
    const { items, deliveryAddressId, paymentMethod, couponCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(deliveryAddressId);
    if (!address) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const normalizedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const quantity = Number(item.quantity || 0);
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid item quantity" });
      }

      if (item.type === "supermarket") {
        const slug = item.productId || item.id || item.referenceId;
        if (!slug) {
          return res.status(400).json({ message: "Product identifier is required" });
        }
        const product = await Product.findOne({ slug });
        if (!product || !product.active) {
          return res.status(400).json({ message: "Product unavailable" });
        }
        if (product.stock < quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }

        const lineTotal = product.price * quantity;
        subtotal += lineTotal;

        normalizedItems.push({
          name: product.name,
          quantity,
          price: lineTotal,
          image: product.image,
          itemType: "supermarket",
          referenceId: product.slug,
        });
      } else if (item.type === "recipe") {
        const recipeId = item.recipeId || item.referenceId;
        const ingredientName = item.ingredientName || item.name;
        if (!recipeId || !ingredientName) {
          return res.status(400).json({ message: "Recipe item is invalid" });
        }

        const recipe = await Recipe.findOne({ slug: recipeId, active: true });
        if (!recipe) {
          return res.status(400).json({ message: "Recipe unavailable" });
        }

        const ingredient = recipe.ingredients.find(
          (entry) => entry.name.toLowerCase() === ingredientName.toLowerCase()
        );

        if (!ingredient) {
          return res.status(400).json({ message: `Ingredient not found for ${recipe.name}` });
        }

        const lineTotal = ingredient.price * quantity;
        subtotal += lineTotal;

        normalizedItems.push({
          name: ingredient.name,
          quantity,
          price: lineTotal,
          image: recipe.image,
          itemType: "recipe",
          referenceId: recipe.slug,
        });
      } else {
        return res.status(400).json({ message: "Invalid item type" });
      }
    }

    const deliveryFee = 49;
    const tax = Math.round(subtotal * 0.18);

    let discount = 0;
    let couponSnapshot;
    if (couponCode) {
      const code = couponCode.toString().trim().toUpperCase();
      const coupon = await Coupon.findOne({ code, active: true });

      if (!coupon) {
        return res.status(400).json({ message: "Invalid or inactive coupon" });
      }
      if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
        return res.status(400).json({ message: "Coupon has expired" });
      }
      if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
        return res.status(400).json({ message: `Minimum order amount is ${coupon.minSubtotal}` });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      discount = Math.min(calculateDiscount(coupon, subtotal), subtotal);
      couponSnapshot = { code: coupon.code, type: coupon.type, amount: coupon.amount };
      coupon.usedCount += 1;
      await coupon.save();
    }

    const total = Math.max(subtotal + deliveryFee + tax - discount, 0);

    const orderId = `SC-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    const now = new Date();
    const deliveryDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const estimatedDelivery =
      deliveryDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) +
      " - between 5:00 PM - 7:00 PM";

    const order = await Order.create({
      user: req.user._id,
      orderId,
      items: normalizedItems,
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      paymentMethod: paymentMethod || "Online Payment",
      deliveryAddress: {
        label: address.label,
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      estimatedDelivery,
      coupon: couponSnapshot,
    });

    for (const item of normalizedItems) {
      if (item.itemType === "supermarket" && item.referenceId) {
        await Product.updateOne(
          { slug: item.referenceId },
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// @route   GET /api/orders
// @desc    Get all orders for logged-in user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

export default router;
