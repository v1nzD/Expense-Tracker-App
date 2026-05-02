import pool from "../config/db.js";

export async function addExpense(req, res) {
  try {
    const user_id = req.user.id;
    const { amount, category_id, description, expense_date } = req.body;

    if (!amount || !expense_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cat = await pool.query(
      "SELECT id FROM categories WHERE id = $1 AND user_id = $2",
      [category_id, user_id],
    );
    if (!cat.rows.length)
      return res.status(403).json({ error: "Invalid category" });

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

    // Guard against invalid category_id
    if (category_id && isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category_id" });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    // Build shared WHERE clause for both queries
    let conditions = "WHERE user_id = $1";
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

    // Run both queries in parallel
    const [result, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM expenses ${conditions} ORDER BY expense_date DESC LIMIT $${index} OFFSET $${index + 1}`,
        [...values, limitNumber, offset],
      ),
      pool.query(`SELECT COUNT(*) FROM expenses ${conditions}`, values),
    ]);

    // query += " ORDER BY expense_date DESC";

    // // add pagination
    // query += ` LIMIT $${index} OFFSET $${index + 1}`;
    // values.push(limitNumber, offset);

    // const result = await pool.query(query, values);

    // // total count
    // const countResult = await pool.query(
    //   "SELECT COUNT(*) FROM expenses where user_id = $1",
    //   [userId],
    // );
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

/**
 * PUT /api/expenses/:id
 * Update an existing expense
 */
export async function editExpense(req, res) {
  try {
    const user_id = req.user.id;
    const expense_id = req.params.id;

    const { amount, description, category_id, expense_date } = req.body;

    if (!expense_id) {
      return res.status(400).json({ error: "Missing or invalid expense ID" });
    }

    if (!amount || !expense_date) {
      return res
        .status(400)
        .json({ error: "Amount and expense date are required" });
    }

    // validate expense
    const existingExpense = await pool.query(
      "SELECT * FROM expenses WHERE id = $1 AND user_id = $2",
      [expense_id, user_id],
    );

    if (existingExpense.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Expense not found or not authorized" });
    }

    // update expense
    let query =
      "UPDATE expenses SET amount = $1, description=$2, category_id=$3, expense_date=$4 WHERE id = $5 AND user_id=$6 RETURNING *";

    const result = await pool.query(query, [
      amount,
      description,
      category_id,
      expense_date,
      expense_id,
      user_id,
    ]);

    return res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error editing expense" });
  }
}

/**
 * DELETE /api/expenses/:id
 * Delete an existing expense
 */
export async function deleteExpense(req, res) {
  try {
    const user_id = req.user.id;
    const expense_id = req.params.id;

    if (!expense_id) {
      return res.status(400).json({ error: "Missing or invalid expense ID" });
    }

    const existingExpense = await pool.query(
      "SELECT * FROM expenses WHERE id = $1 and user_id = $2",
      [expense_id, user_id],
    );

    if (existingExpense.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Expense not found or not authorized" });
    }

    let query =
      "DELETE FROM expenses WHERE id =$1 AND user_id = $2 RETURNING id";

    const result = await pool.query(query, [expense_id, user_id]);

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error deleting expense" });
  }
}
