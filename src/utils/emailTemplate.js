// for customer
function signUpTemplate() {
    return `<!DOCTYPE html>
    <html>
    <head>
        <title>Welcome to Our Store</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; }
            .header { background: #0078D7; color: white; text-align: center; padding: 15px; font-size: 24px; }
            .content { padding: 20px; text-align: center; }
            .button { background: #0078D7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
            .footer { text-align: center; padding: 10px; font-size: 12px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Welcome to Our Store!</div>
            <div class="content">
                <h2>Hello {{customerName}},</h2>
                <p>Thanks for signing up at <strong>Our E-Commerce Store</strong>! We're excited to have you onboard.</p>
                <p>Start shopping now and explore our latest collections.</p>
                <a href="#" class="button">Start Shopping</a>
            </div>
            <div class="footer">
                &copy; 2024 Our Store. All Rights Reserved.
            </div>
        </div>
    </body>
    </html>`;
  }
  
  // by customer
  function orderProduct() {
    return `<!DOCTYPE html>
    <html>
    <head>
        <title>Your Order is Confirmed</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; }
            .header { background: #0078D7; color: white; text-align: center; padding: 15px; font-size: 24px; }
            .content { padding: 20px; text-align: left; }
            .order-details { background: #f9f9f9; padding: 15px; border-radius: 5px; }
            .button { background: #0078D7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
            .footer { text-align: center; padding: 10px; font-size: 12px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Your Order is Confirmed!</div>
            <div class="content">
                <h2>Hi {{customerName}},</h2>
                <p>We have received your order. Here are the details:</p>
                <div class="order-details">
                    <p><strong>Order ID:</strong> {{orderId}}</p>
                    <p><strong>Product Name:</strong> {{productName}}</p>
                    <p><strong>Quantity:</strong> {{quantity}}</p>
                    <p><strong>Shipping Address:</strong> {{shippingAddress}}</p>
                </div>
                <p>We will update you once your order is shipped.</p>
                <a href="#" class="button">Track Order</a>
            </div>
            <div class="footer">
                &copy; 2024 Our Store. All Rights Reserved.
            </div>
        </div>
    </body>
    </html>`;
  }
  
  // by admin
  function orderStatusChange() {
    return `<!DOCTYPE html>
    <html>
    <head>
        <title>Order Status Updated</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; }
            .header { background: #0078D7; color: white; text-align: center; padding: 15px; font-size: 24px; }
            .content { padding: 20px; text-align: left; }
            .status { font-size: 18px; font-weight: bold; color: #0078D7; }
            .button { background: #0078D7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
            .footer { text-align: center; padding: 10px; font-size: 12px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Order Status Update</div>
            <div class="content">
                <h2>Hi {{customerName}},</h2>
                <p>Your order <strong>#{{orderId}}</strong> status has been updated.</p>
                <p class="status">New Status: {{orderStatus}}</p>
                <p>Click below to track your order:</p>
                <a href="#" class="button">Track Order</a>
            </div>
            <div class="footer">
                &copy; 2024 Our Store. All Rights Reserved.
            </div>
        </div>
    </body>
    </html>`;
  }
  
  // from admin side after complete the order
  function feedbackRequest() {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>We Value Your Feedback!</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; background: #ffffff; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; padding: 10px 0; }
            .header h1 { color: #333; }
            .content { padding: 20px; text-align: center; }
            .btn { background: #ff6600; color: #fff; padding: 12px 20px; text-decoration: none; font-size: 18px; border-radius: 5px; display: inline-block; margin-top: 20px; }
            .footer { text-align: center; font-size: 14px; color: #666; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Thanks for Your Order!</h1>
            </div>
            <div class="content">
                <p>Hello [Customer Name],</p>
                <p>We hope you are enjoying your recent purchase from [Your Store Name]. Your feedback helps us improve!</p>
                <p>Please take a moment to share your experience with us.</p>
                <a href="[Feedback Link]" class="btn">Leave a Review</a>
            </div>
            <div class="footer">
                <p>Need help? Contact us at [Your Support Email]</p>
                <p>&copy; [Your Store Name] | All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
  }
  
  // payment status
  function paymentStatus() {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Payment Status Update</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; background: #ffffff; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; padding: 10px 0; }
            .header h1 { color: #333; }
            .content { padding: 20px; text-align: center; }
            .status { font-size: 18px; font-weight: bold; color: green; }
            .btn { background: #007bff; color: #fff; padding: 12px 20px; text-decoration: none; font-size: 18px; border-radius: 5px; display: inline-block; margin-top: 20px; }
            .footer { text-align: center; font-size: 14px; color: #666; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Payment Status Update</h1>
            </div>
            <div class="content">
                <p>Hello [Customer Name],</p>
                <p>Your recent transaction with Order ID <strong>[Order ID]</strong> has been updated.</p>
                <p class="status">Payment Status: <strong>[Paid / Failed / Refunded]</strong></p>
                <p>If you have any questions, please contact our support team.</p>
                <a href="[Your Support Link]" class="btn">Contact Support</a>
            </div>
            <div class="footer">
                <p>Thank you for shopping with [Your Store Name]</p>
                <p>&copy; [Your Store Name] | All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
  }
  
  // user forgot password
  function otpTemplate({ customerName, otp }) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Hello ${customerName},</h2>
      <p>You requested a password reset. Use the OTP below to proceed:</p>
      <h1 style="color: #0078D7;">${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br>
      <p>– Grocery Team </p>
    </div>
    `;
  }
  
  // user reset password
  function resetPasswordTemplate({ customerName }) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Hello ${customerName},</h2>
      <p>Your password has been successfully reset.</p>
      <p>If you didn't make this change, please contact our support team immediately.</p>
      <br>
      <p>– Grocery Team</p>
    </div>
    `;
  }
  
  export {
    signUpTemplate,
    orderProduct,
    orderStatusChange,
    feedbackRequest,
    paymentStatus,
    otpTemplate,
    resetPasswordTemplate
  };
  