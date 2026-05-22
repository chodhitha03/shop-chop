import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    type: { type: String, enum: ["percent", "flat"], required: true },
    amount: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date },
    active: { type: Boolean, default: true },
    usageLimit: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
