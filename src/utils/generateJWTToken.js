// src/utils/generateTokens.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWTSECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "YourRefreshTokenSecret";

/**
 * Generates both an access token and a refresh token, then sets them as secure HTTP‑only cookies.
 *
 * @param {Object} res - Express response object.
 * @param {Object} userDetails - Object containing user details (e.g. id, userName, email, roleType).
 * @returns {Object} - Contains both tokens (if you need to return them for logging or further processing).
 */
export async function generateToken(res, userDetails) {
  // Generate the access token (valid for 1 hour)
  const accessToken = jwt.sign(
    { data: userDetails },
    accessTokenSecret,
    { expiresIn: "1h" }
  );

  // Generate the refresh token (valid for 7 days)
  const refreshToken = jwt.sign(
    { data: userDetails },
    refreshTokenSecret,
    { expiresIn: "7d" }
  );

  // Set the access token as an HTTP‑only cookie
  res.cookie("accessToken", accessToken, {
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development"
  });

  // Set the refresh token as an HTTP‑only cookie
  res.cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development"
  });

  return { accessToken, refreshToken };
}
