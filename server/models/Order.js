import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  itemType: { type: String, enum: ["supermarket", "recipe"], required: true },
  referenceId: { type: String },
});

const deliveryAddressSchema = new mongoose.Schema(
  {
    label: { type: String },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const couponSnapshotSchema = new mongoose.Schema(
  {
    code: { type: String },
    type: { type: String, enum: ["percent", "flat"] },
    amount: { type: Number },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "Online Payment" },
    deliveryAddress: { type: deliveryAddressSchema, required: true },
    estimatedDelivery: { type: String },
    coupon: { type: couponSnapshotSchema },
    status: {
      type: String,
      enum: ["confirmed", "preparing", "shipped", "delivered", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
