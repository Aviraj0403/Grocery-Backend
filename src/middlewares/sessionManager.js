const { v4: uuidv4 , validate: uuidValidate } = require("uuid");

const sessionManager = (req, res, next) => {
  let sessionId = req.cookies.sessionId;

  if (!req.user) {
    if (!sessionId || !uuidValidate(sessionId)) {
      // gnrt uuid if missing or invalid
      sessionId = uuidv4();
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "none",
        secure: process.env.NODE_ENV !== "development",
      });
    }

    req.sessionId = sessionId;
  } else {
    req.sessionId = null; 
  }

  next();
};

module.exports = sessionManager;
