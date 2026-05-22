import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// @route   GET /api/products
// @desc    Get active products
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { active: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// @route   GET /api/products/:slug
// @desc    Get a product by slug
// @access  Public
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, active: true });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

export default router;
