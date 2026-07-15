import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT 1");

    console.log("Neon PostgreSQL connected successfully");

    app.listen(PORT, () => {
      console.log(`UNWIND backend running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start UNWIND backend:", error.message);
    process.exit(1);
  }
}

startServer();