// middlewares/authAdmin.js
export const authAdmin = (req, res, next) => {
  if (!req.user || req.user.roleType !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
