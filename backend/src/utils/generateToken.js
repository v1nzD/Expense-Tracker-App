import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    ENV.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}
