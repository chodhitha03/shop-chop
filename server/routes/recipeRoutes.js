import express from "express";
import Recipe from "../models/Recipe.js";

const router = express.Router();

// @route   GET /api/recipes
// @desc    Get active recipes
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

    const recipes = await Recipe.find(query).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error("Get recipes error:", error);
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
});

// @route   GET /api/recipes/:slug
// @desc    Get a recipe by slug
// @access  Public
router.get("/:slug", async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug, active: true });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    console.error("Get recipe error:", error);
    res.status(500).json({ message: "Failed to fetch recipe" });
  }
});

export default router;
