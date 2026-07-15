import jwt from "jsonwebtoken";

export function generateAccessToken(user) {
  return jwt.sign(
    {
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    {
      subject: user.user_id,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
    }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    {
      role: user.role
    },
    process.env.JWT_REFRESH_SECRET,
    {
      subject: user.user_id,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d"
    }
  );
}