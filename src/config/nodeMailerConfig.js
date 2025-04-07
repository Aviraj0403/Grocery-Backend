const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.MAIL_FROM,
    pass: process.env.PASS_KEY,
  },
});

module.exports = transporter;
