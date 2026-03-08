import express from "express";
import { registerRoutes } from "./routes";
import { connectDB } from "./db";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

/* ============================= */
/*        MIDDLEWARE SETUP       */
/* ============================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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