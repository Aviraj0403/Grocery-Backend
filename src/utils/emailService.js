import transporter from "../config/nodeMailerConfig.js";

import {
  signUpTemplate,
  orderProduct,
  paymentStatus,
  feedbackRequest,
  orderStatusChange,
  otpTemplate,
  resetPasswordTemplate,
} from "./emailTemplate.js";
import dotenv from "dotenv";

dotenv.config();

async function sendMailer(mailTo, subject, emailFor, dynamicData = {}) {
  const subjects = [
    "Tell us what you think! Review your recent purchase",        // 0
    "Your payment for Order #[Order ID] was successful",          // 1
    "Thanks for signing up! Your shopping journey begins now",    // 2
    "Exciting! Your order is confirmed",                          // 3
    "Your order status has been updated",                         // 4
    "Password Reset OTP",                                         // 5
    "Password Reset Confirmation",                                // 6
  ];

  let finalSubject = "";
  let finalHtml = "";

  if (emailFor === "signUp") {
    finalSubject = subjects[2];
    finalHtml = signUpTemplate();
  } else if (emailFor === "orderStatus") {
    finalSubject = subjects[4];
    finalHtml = orderStatusChange();
  } else if (emailFor === "paymentConfirmation") {
    finalSubject = subjects[1];
    finalHtml = paymentStatus();
  } else if (emailFor === "review") {
    finalSubject = subjects[0];
    finalHtml = feedbackRequest();
  } else if (emailFor === "orderProduct") {
    finalSubject = subjects[3];
    finalHtml = orderProduct();
  } else if (emailFor === "otp") {
    finalSubject = subjects[5];
    finalHtml = otpTemplate(dynamicData); // ✅ Dynamic OTP goes here
  } else if (emailFor === "resetPassword") {
    finalSubject = subjects[6];
    finalHtml = resetPasswordTemplate(dynamicData);
  }

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: mailTo,
    subject: finalSubject,
    html: finalHtml,
  });

  console.log("Email sent: ", info.messageId);
}

export default sendMailer;
