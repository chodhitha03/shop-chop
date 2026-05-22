import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true },
    category: {
      type: String,
      enum: ["fruits", "vegetables", "bakery", "beverages", "spices", "dairy", "meat", "pantry"],
      required: true,
    },
    stock: { type: Number, default: 0, min: 0 },
    unit: { type: String, trim: true },
    onSale: { type: Boolean, default: false },
    originalPrice: { type: Number, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
