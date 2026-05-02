import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";

export async function registerUser(req, res) {
  try {
    const { first_name, last_name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    if (!first_name || !last_name || !normalizedEmail || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail],
    );

    // validate email/user
    if (existingUser.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Email already exists. Please log in instead." });
    }

    let query =
      " INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, email";

    const result = await pool.query(query, [
      first_name,
      last_name,
      normalizedEmail,
      hashedPassword,
    ]);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error registering user" });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // find user in db
    const normalizedEmail = email.toLowerCase();

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      normalizedEmail,
    ]);

    // validate user
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error logging in user" });
  }
}
