import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWTSECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "YourRefreshTokenSecret";

// Correct isProduction check: true when in production mode
const isProduction = process.env.NODE_ENV === "development" ;
console.log("isProduction:", isProduction);

/**
 * Generates access + refresh tokens and sets them in secure HTTP-only cookies.
 * Automatically adjusts cookie settings for dev vs. prod.
 */
export async function generateToken(res, userDetails) {
  // Access token: valid for 1 hour
  const accessToken = jwt.sign(
    { data: userDetails },
    accessTokenSecret,
    { expiresIn: "1h" }
  );

  // Refresh token: valid for 7 days
  const refreshToken = jwt.sign(
    { data: userDetails },
    refreshTokenSecret,
    { expiresIn: "7d" }
  );

  // 🔐 Cookie options (secure only in production, with path)
  const cookieOptions = {
    httpOnly: true,
    secure:true,
    sameSite: None,
    path: "/",   // IMPORTANT: must include path for clearing cookie later
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { accessToken, refreshToken };
}
