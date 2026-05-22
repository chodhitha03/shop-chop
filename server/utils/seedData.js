import Product from "../models/Product.js";
import Recipe from "../models/Recipe.js";
import { products } from "../data/products.js";
import { recipes } from "../data/recipes.js";

export const seedDataIfEmpty = async () => {
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(products);
  }

  const recipeCount = await Recipe.countDocuments();
  if (recipeCount === 0) {
    await Recipe.insertMany(recipes);
  }
};
