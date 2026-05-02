import pool from "../config/db.js";

export async function getExpenseSummary(req, res) {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const queryTotal =
      "SELECT COALESCE(SUM(amount), 0) AS total_spent FROM expenses WHERE user_id = $1";

    const queryCategoryTotal = `SELECT c.name, COALESCE(SUM(e.amount), 0) AS total
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
       GROUP BY c.id, c.name
       ORDER BY total DESC`;

    const [totalResult, categoryResult] = await Promise.all([
      pool.query(queryTotal, [user_id]),
      pool.query(queryCategoryTotal, [user_id]),
    ]);

    return res.status(200).json({
      total_spent: Number(totalResult.rows[0].total_spent),
      by_category: categoryResult.rows.map((row) => ({
        name: row.name,
        total: Number(row.total),
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error getting expense summary" });
  }
}

export async function getExpensesMonthly(req, res) {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', expense_date), 'YYYY-MM') AS month,
        COALESCE(SUM(amount), 0) AS total
      FROM expenses
      WHERE user_id = $1
      GROUP BY month
      ORDER BY month;
    `;
    const result = await pool.query(query, [user_id]);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error getting expenses monthly" });
  }
}
