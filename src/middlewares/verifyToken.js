import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.ACCESS_TOKEN_SECRET; 

export const verifyToken = (req, res, next) => {
  console.log("Verifying token...");

  // Try to get token from cookie OR Authorization header
  // const cookieToken = req.cookies?.jwt;
  const cookieToken = req.cookies?.accessToken;

  const headerToken = req.headers.authorization?.split(" ")[1];

  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({
      message: "Access Denied! Token Broken or Expired",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);  // Corrected

    if (!decoded?.data) {
      return res.status(401).json({
        message: "User data not available",
      });
    }

    const { id, userName, email, roleType } = decoded.data;
    req.user = { id, userName, email, roleType };

    console.log("User token verified:", req.user);
    next();
  } catch (error) {
    return res.status(400).json({
      message: "Invalid Token",
      error: error.message,
    });
  }
};
