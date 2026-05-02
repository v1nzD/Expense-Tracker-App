import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export function generateToken(user) {
  return jwt.sign({ id: user.id }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });
}
