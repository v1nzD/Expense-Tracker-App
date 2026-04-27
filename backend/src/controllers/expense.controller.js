import pool from "../config/db.js";

export async function addExpense(req, res) {
  try {
    const { user_id, amount, category_id, description, expense_date } =
      req.body;

    if (!user_id || !amount || !expense_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      "INSERT INTO expenses (user_id, amount, category_id, description, expense_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, amount, category_id, description, expense_date],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error adding expense" });
  }
}

export async function getExpenses(req, res) {
  try {
    const { user_id, category_id, start_date, end_date } = req.query;

    // validate user
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userId = parseInt(user_id);
    const categoryId = category_id ? parseInt(category_id) : null;

    let query = "SELECT * FROM expenses WHERE user_id = $1";
    let values = [user_id];
    let index = 2;

    if (category_id) {
      query += ` AND category_id = $${index}`;
      values.push(category_id);
      index++;
    }

    if (start_date) {
      query += ` AND expense_date >= $${index}`;
      values.push(start_date);
      index++;
    }

    if (end_date) {
      query += ` AND expense_date <= $${index}`;
      values.push(end_date);
      index++;
    }

    query += " ORDER BY expense_date DESC";

    const result = await pool.query(query, values);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error gettting expenses" });
  }
}
