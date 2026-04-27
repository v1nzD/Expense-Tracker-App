import express from "express";
import { ENV } from "./config/env.js";
import pool from "./config/db.js";

const app = express();
const PORT = ENV.PORT;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(PORT, async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("DB connected:", res.rows[0]);
  } catch (err) {
    console.error("DB connection failed", err);
  }

  console.log(`Server running on port ${PORT}`);
});
