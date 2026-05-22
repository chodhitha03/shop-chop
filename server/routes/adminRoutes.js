import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Recipe from "../models/Recipe.js";
import Coupon from "../models/Coupon.js";

const router = express.Router();

router.use(protect, adminOnly);

// @route   GET /api/admin/stats
// @desc    Get basic stats
// @access  Admin
router.get("/stats", async (req, res) => {
  try {
    const [users, orders, products, recipes, coupons] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Recipe.countDocuments(),
      Coupon.countDocuments(),
    ]);

    const salesAgg = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$total" } } },
    ]);

    res.json({
      users,
      orders,
      products,
      recipes,
      coupons,
      totalSales: salesAgg[0]?.totalSales || 0,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Admin
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Admin orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Admin
router.put("/orders/:id/status", async (req, res) => {
  try {
    const status = req.body.status?.toString();
    const allowed = ["confirmed", "preparing", "shipped", "delivered", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    console.error("Admin update order error:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("name email isBlocked createdAt").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block or unblock user
// @access  Admin
router.put("/users/:id/block", async (req, res) => {
  try {
    const isBlocked = Boolean(req.body.isBlocked);
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = isBlocked;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Admin block user error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products
// @access  Admin
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Admin products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// @route   POST /api/admin/products
// @desc    Create product
// @access  Admin
router.post("/products", async (req, res) => {
  try {
    const payload = {
      slug: req.body.slug?.toString().trim().toLowerCase(),
      name: req.body.name?.toString().trim(),
      description: req.body.description?.toString().trim() || "",
      price: Number(req.body.price),
      image: req.body.image?.toString().trim() || "",
      category: req.body.category,
      stock: Number(req.body.stock || 0),
      unit: req.body.unit?.toString().trim() || "",
      onSale: Boolean(req.body.onSale),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      active: req.body.active !== undefined ? Boolean(req.body.active) : true,
    };

    if (!payload.slug || !payload.name || !payload.category || Number.isNaN(payload.price)) {
      return res.status(400).json({ message: "Missing required product fields" });
    }

    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (error) {
    console.error("Admin create product error:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Admin
router.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.slug = req.body.slug?.toString().trim().toLowerCase() || product.slug;
    product.name = req.body.name?.toString().trim() || product.name;
    product.description = req.body.description?.toString().trim() || product.description;
    if (req.body.price !== undefined) {
      product.price = Number(req.body.price);
    }
    if (req.body.image !== undefined) {
      product.image = req.body.image?.toString().trim();
    }
    if (req.body.category) {
      product.category = req.body.category;
    }
    if (req.body.stock !== undefined) {
      product.stock = Number(req.body.stock);
    }
    if (req.body.unit !== undefined) {
      product.unit = req.body.unit?.toString().trim();
    }
    if (req.body.onSale !== undefined) {
      product.onSale = Boolean(req.body.onSale);
    }
    if (req.body.originalPrice !== undefined) {
      product.originalPrice = req.body.originalPrice ? Number(req.body.originalPrice) : undefined;
    }
    if (req.body.active !== undefined) {
      product.active = Boolean(req.body.active);
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Admin update product error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Disable product
// @access  Admin
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.active = false;
    await product.save();
    res.json({ message: "Product disabled" });
  } catch (error) {
    console.error("Admin delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// @route   GET /api/admin/recipes
// @desc    Get all recipes
// @access  Admin
router.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error("Admin recipes error:", error);
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
});

// @route   POST /api/admin/recipes
// @desc    Create recipe
// @access  Admin
router.post("/recipes", async (req, res) => {
  try {
    const payload = {
      slug: req.body.slug?.toString().trim().toLowerCase(),
      name: req.body.name?.toString().trim(),
      description: req.body.description?.toString().trim() || "",
      image: req.body.image?.toString().trim() || "",
      category: req.body.category,
      cookingTime: Number(req.body.cookingTime),
      servings: Number(req.body.servings),
      ingredients: Array.isArray(req.body.ingredients) ? req.body.ingredients : [],
      instructions: Array.isArray(req.body.instructions) ? req.body.instructions : [],
      active: req.body.active !== undefined ? Boolean(req.body.active) : true,
    };

    if (!payload.slug || !payload.name || !payload.category) {
      return res.status(400).json({ message: "Missing required recipe fields" });
    }

    const recipe = await Recipe.create(payload);
    res.status(201).json(recipe);
  } catch (error) {
    console.error("Admin create recipe error:", error);
    res.status(500).json({ message: "Failed to create recipe" });
  }
});

// @route   PUT /api/admin/recipes/:id
// @desc    Update recipe
// @access  Admin
router.put("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    recipe.slug = req.body.slug?.toString().trim().toLowerCase() || recipe.slug;
    recipe.name = req.body.name?.toString().trim() || recipe.name;
    recipe.description = req.body.description?.toString().trim() || recipe.description;
    recipe.image = req.body.image?.toString().trim() || recipe.image;
    if (req.body.category) {
      recipe.category = req.body.category;
    }
    if (req.body.cookingTime !== undefined) {
      recipe.cookingTime = Number(req.body.cookingTime);
    }
    if (req.body.servings !== undefined) {
      recipe.servings = Number(req.body.servings);
    }
    if (Array.isArray(req.body.ingredients)) {
      recipe.ingredients = req.body.ingredients;
    }
    if (Array.isArray(req.body.instructions)) {
      recipe.instructions = req.body.instructions;
    }
    if (req.body.active !== undefined) {
      recipe.active = Boolean(req.body.active);
    }

    await recipe.save();
    res.json(recipe);
  } catch (error) {
    console.error("Admin update recipe error:", error);
    res.status(500).json({ message: "Failed to update recipe" });
  }
});

// @route   DELETE /api/admin/recipes/:id
// @desc    Disable recipe
// @access  Admin
router.delete("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    recipe.active = false;
    await recipe.save();
    res.json({ message: "Recipe disabled" });
  } catch (error) {
    console.error("Admin delete recipe error:", error);
    res.status(500).json({ message: "Failed to delete recipe" });
  }
});

// @route   GET /api/admin/coupons
// @desc    Get all coupons
// @access  Admin
router.get("/coupons", async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error("Admin coupons error:", error);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
});

// @route   POST /api/admin/coupons
// @desc    Create coupon
// @access  Admin
router.post("/coupons", async (req, res) => {
  try {
    const payload = {
      code: req.body.code?.toString().trim().toUpperCase(),
      type: req.body.type,
      amount: Number(req.body.amount),
      minSubtotal: Number(req.body.minSubtotal || 0),
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      active: req.body.active !== undefined ? Boolean(req.body.active) : true,
      usageLimit: Number(req.body.usageLimit || 0),
    };

    if (!payload.code || !payload.type || Number.isNaN(payload.amount)) {
      return res.status(400).json({ message: "Missing required coupon fields" });
    }

    const coupon = await Coupon.create(payload);
    res.status(201).json(coupon);
  } catch (error) {
    console.error("Admin create coupon error:", error);
    res.status(500).json({ message: "Failed to create coupon" });
  }
});

// @route   PUT /api/admin/coupons/:id
// @desc    Update coupon
// @access  Admin
router.put("/coupons/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (req.body.code) {
      coupon.code = req.body.code.toString().trim().toUpperCase();
    }
    if (req.body.type) {
      coupon.type = req.body.type;
    }
    if (req.body.amount !== undefined) {
      coupon.amount = Number(req.body.amount);
    }
    if (req.body.minSubtotal !== undefined) {
      coupon.minSubtotal = Number(req.body.minSubtotal);
    }
    if (req.body.expiresAt !== undefined) {
      coupon.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : undefined;
    }
    if (req.body.active !== undefined) {
      coupon.active = Boolean(req.body.active);
    }
    if (req.body.usageLimit !== undefined) {
      coupon.usageLimit = Number(req.body.usageLimit);
    }

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    console.error("Admin update coupon error:", error);
    res.status(500).json({ message: "Failed to update coupon" });
  }
});

// @route   DELETE /api/admin/coupons/:id
// @desc    Disable coupon
// @access  Admin
router.delete("/coupons/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.active = false;
    await coupon.save();
    res.json({ message: "Coupon disabled" });
  } catch (error) {
    console.error("Admin delete coupon error:", error);
    res.status(500).json({ message: "Failed to delete coupon" });
  }
});

export default router;
