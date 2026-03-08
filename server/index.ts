import express from "express";
import { registerRoutes } from "./routes";
import { connectDB } from "./db";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

/* ============================= */
/*        MIDDLEWARE SETUP       */
/* ============================= */

// Security headers (XSS, clickjacking, MIME sniffing protection)
app.use(helmet());

// CORS configuration (use environment variable, fallback to localhost for dev)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting to prevent brute force and DoS attacks
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", apiRateLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ============================= */
/*          SERVER START         */
/* ============================= */

(async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Register API routes
    registerRoutes(app);

    const port = parseInt(process.env.PORT || "5000", 10);

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();