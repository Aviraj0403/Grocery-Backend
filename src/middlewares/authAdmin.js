const { mongo } = require("mongoose");

const authAdmin = async (req, res, next) => {
  if (req.user.roleType !== "admin") {
    return res.status(403).json({ message: "Access Denied. Admins only." });
  }
  next();
};
module.exports = authAdmin;