import dotenv from "dotenv";

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI,
  mongoDb: process.env.MONGODB_DB || "shopchop",
  jwtSecret: process.env.JWT_SECRET,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:8080",
  adminEmails: [
    "maripellichodhitha@gmail.com",
    "chitikeshimahesh6@gmail.com",
  ].map((email) => email.toLowerCase()),
};

if (!config.mongoUri) {
  throw new Error("MONGODB_URI is required in the environment.");
}

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET is required in the environment.");
}

export default config;
