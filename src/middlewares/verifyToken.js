const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWTSECRET;
function verifyToken(req, res, next) {
  console.log("Token work");
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({
      message: "Access Denied! Token Broken or Expire",
    });
    // return next(); // now for guest
  }
  try{
  const decoded = jwt.verify(token, secret);
  if (!decoded.data) {
    return res.status(401).json({
      message: "User data not available",
    });
    // next();
  }
  const { id, userName, email, roleType } = decoded.data;
  req.user = { id, userName, email, roleType };
  console.log("user token", req.user)
  next();
  } catch (error) {
    return res.status(400).json({
      message: "Invalid Token",
      error: error.message,
    });
  }
}
module.exports = verifyToken;
