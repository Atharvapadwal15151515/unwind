import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";

import {
  generalLimiter
} from "./middleware/rateLimiter.js";

import {
  notFound
} from "./middleware/notFound.js";

import {
  errorHandler
} from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

/*
|--------------------------------------------------------------------------
| Body Parsing
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Global Rate Limiter
|--------------------------------------------------------------------------
*/

app.use(generalLimiter);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "UNWIND Authentication API is running 🚀"
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(notFound);

/*
|--------------------------------------------------------------------------
| Global Error Handler (Must be last)
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

export default app;