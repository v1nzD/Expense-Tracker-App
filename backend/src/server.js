import express from "express";
import { ENV } from "./config/env.js";
import pool from "./config/db.js";
import expenseRouter from "./routes/expense.route.js";

const app = express();
const PORT = ENV.PORT;

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.send("API is running");
});

app.use("/api/expenses", expenseRouter);

app.listen(PORT, async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("DB connected:", res.rows[0]);
  } catch (err) {
    console.error("DB connection failed", err);
  }

  console.log(`Server running on port ${PORT}`);
});
