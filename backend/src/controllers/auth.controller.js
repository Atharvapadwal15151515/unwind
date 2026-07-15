import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  logoutUserFromAllDevices,
  getAuthenticatedUser,
  verifyEmailWithOTP,
  verifyEmailWithLink,
  resendEmailVerification
} from "../services/auth.service.js";

import {
  sendRefreshTokenCookie,
  clearRefreshTokenCookie
} from "../utils/sendCookie.js";

/**
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const result = await registerUser({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      fullName: req.body.fullName,
      displayName: req.body.displayName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      occupationType: req.body.occupationType
    });

    return res.status(201).json({
      success: true,
      message:
        "Account created. Check your email for the verification OTP or link.",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
 const result = await loginUser({
  identifier: req.body.identifier,
  password: req.body.password,
  deviceName: req.body.deviceName || null,
  browser: req.body.browser || null,
  operatingSystem: req.body.operatingSystem || null,
  ipAddress: req.ip || null,
  userAgent: req.get("user-agent") || null
});

    sendRefreshTokenCookie(res, result.refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
        sessionId: result.sessionId
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refreshToken(req, res, next) {
  try {
    const currentRefreshToken =
      req.cookies?.refreshToken;

    const result = await refreshUserSession(
      currentRefreshToken
    );

    sendRefreshTokenCookie(
      res,
      result.refreshToken
    );

    return res.status(200).json({
      success: true,
      message: "Session refreshed",
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    clearRefreshTokenCookie(res);
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res, next) {
  try {
    const refreshToken =
      req.cookies?.refreshToken;

    await logoutUser(refreshToken);

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout-all
 */
export async function logoutAllDevices(
  req,
  res,
  next
) {
  try {
    await logoutUserFromAllDevices(
      req.user.user_id
    );

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message:
        "Logged out from all devices successfully"
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 */
export async function getCurrentUser(
  req,
  res,
  next
) {
  try {
    const user = await getAuthenticatedUser(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/verify-email-otp
 */
export async function verifyEmailOTP(
  req,
  res,
  next
) {
  try {
    const result = await verifyEmailWithOTP({
      email: req.body.email,
      otp: req.body.otp
    });

    return res.status(200).json({
      success: true,
      message: result.alreadyVerified
        ? "Email is already verified"
        : "Email verified successfully",
      data: {
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/verify-email-link
 */
export async function verifyEmailLink(
  req,
  res,
  next
) {
  try {
    const result = await verifyEmailWithLink({
      userId: req.body.userId,
      token: req.body.token
    });

    return res.status(200).json({
      success: true,
      message: result.alreadyVerified
        ? "Email is already verified"
        : "Email verified successfully",
      data: {
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/resend-verification
 */
export async function resendVerification(
  req,
  res,
  next
) {
  try {
    await resendEmailVerification(
      req.body.email
    );

    return res.status(200).json({
      success: true,
      message:
        "If an unverified account exists, a new verification email has been sent."
    });
  } catch (error) {
    next(error);
  }
}