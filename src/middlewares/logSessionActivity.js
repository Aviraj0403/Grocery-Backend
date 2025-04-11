import { createLogger, format, transports } from "winston";

export const logSessionActivity = (req, res, next) => {
  const userLabel = req.user ? `User: ${req.user.email}` : "Login kr lo bhaiya";
  console.log(`[Session] ${userLabel} - ${req.method} ${req.originalUrl}`);
  next();
};
