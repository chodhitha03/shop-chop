import config from "../config.js";

export const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const email = req.user.email.toLowerCase();
  if (!config.adminEmails.includes(email)) {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};
