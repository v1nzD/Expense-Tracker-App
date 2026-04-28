import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const protectRoute = async (req, res, next) => {
  try {
    // get token from header
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unathorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // verify token
    jwt.verify(token, ENV.JWT_SECRET, (err, decodedUser) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      // attach user info to request and proceed
      req.user = decodedUser;

      next();
    });
  } catch (error) {
    console.error("Error in protectRoute middleware", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
