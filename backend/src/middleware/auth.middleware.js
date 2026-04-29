import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const protectRoute = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decodedUser = jwt.verify(token, ENV.JWT_SECRET);

    req.user = decodedUser;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
