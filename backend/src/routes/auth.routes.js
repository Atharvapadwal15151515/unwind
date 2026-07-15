import express from "express";

import {
  register,
  login,
  refreshToken,
  logout,
  logoutAllDevices,
  getCurrentUser,
  verifyEmailOTP,
  verifyEmailLink,
  resendVerification
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

router.post("/verify-email-otp", verifyEmailOTP);
router.post("/verify-email-link", verifyEmailLink);
router.post("/resend-verification", resendVerification);

router.post(
  "/logout-all",
  authenticate,
  logoutAllDevices
);

router.get(
  "/me",
  authenticate,
  getCurrentUser
);

export default router;