import pool from "../config/db.js";

export async function addExpense(req, res) {
  try {
    const user_id = req.user.id;
    const { amount, category_id, description, expense_date } = req.body;

    if (!amount || !expense_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      "INSERT INTO expenses (user_id, amount, category_id, description, expense_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, amount, category_id, description, expense_date],
    );

    return res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error adding expense" });
  }
}

export async function getExpenses(req, res) {
  try {
    const user_id = req.user.id;
    const {
      category_id,
      start_date,
      end_date,
      page = 1,
      limit = 10,
    } = req.query;

    const userId = parseInt(user_id);
    const categoryId = category_id ? parseInt(category_id) : null;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    let query = "SELECT * FROM expenses WHERE user_id = $1";
    let values = [userId];
    let index = 2;

    if (category_id) {
      query += ` AND category_id = $${index}`;
      values.push(categoryId);
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

    // add pagination
    query += ` LIMIT $${index} OFFSET $${index + 1}`;
    values.push(limitNumber, offset);

    const result = await pool.query(query, values);

    // total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM expenses where user_id = $1",
      [userId],
    );
    // let countQuery = "SELECT COUNT(*) FROM expenses WHERE user_id = $1";
    // let countValues = [userId];

    return res.status(200).json({
      page: pageNumber,
      limit: limitNumber,
      total: parseInt(countResult.rows[0].count),
      data: result.rows,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error gettting expenses" });
  }
}
