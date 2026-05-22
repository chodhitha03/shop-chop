import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./db.js";
import config from "./config.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { seedDataIfEmpty } from "./utils/seedData.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS — allow both localhost and Vercel production
const allowedOrigins = [
  config.clientOrigin,
  "https://shop-chop-ten.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/products", productRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: config.nodeEnv === "production" ? null : err.stack,
  });
});

// Database connection & Server start
const startServer = async () => {
  try {
    await connectDb();
    console.log("MongoDB Connected");

    await seedDataIfEmpty();

    app.listen(config.port, () => {
      console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(1);
  }
};

startServer();
