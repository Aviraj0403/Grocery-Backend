const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWTSECRET;
export async function generateToken(res, userDetails) {
  // const { id, userName, email, roleType } = userDetails;
  const token = jwt.sign(
    {
      data: userDetails,
    },
    secret,
    { expiresIn: 60 * 60 }
  );
  res.cookie("jwt", token, {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
  // return token ; //misisng token
}


