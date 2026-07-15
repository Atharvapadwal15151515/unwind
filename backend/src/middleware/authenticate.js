import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing"
    });
  }

  const [tokenType, token] = authHeader.split(" ");

  if (tokenType !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization format"
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    req.user = {
      user_id: decoded.sub,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid access token"
    });
  }
}