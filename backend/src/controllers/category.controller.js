import pool from "../config/db.js";

/**
 * GET /api/categories
 * Returns all categories belonging to the authenticated user.
 */
export async function getCategories(req, res) {
  try {
    const user_id = req.user.id;

    let query =
      "SELECT id, name FROM categories WHERE user_id = $1 OR user_id IS NULL ORDER BY name ASC";

    const result = await pool.query(query, [user_id]);

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error gettting categories" });
  }
}

/**
 * POST /api/categories
 * Creates a new category for the authenticated user.
 */
export async function addCategory(req, res) {
  try {
    const user_id = req.user.id;

    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    let query =
      "INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING id, name";

    const result = await pool.query(query, [name.trim(), user_id]);

    return res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    if (error.code == "23505") {
      return res.status(409).json({ error: "Category already exists" });
    }
    console.log(error);
    return res.status(500).json({ error: "Error adding category" });
  }
}

/**
 * DELETE /api/categories/:id
 * Deletes a category owned by the authenticated user.
 * Expenses linked to this category will have category_id set to NULL (per schema).
 */
export async function deleteCategory(req, res) {
  try {
    const { user_id } = req.user.id;
    const { category_id } = parseInt(req.params.id);

    if (!category_id) {
      return res.status(400).json({ error: "Missing category id" });
    }

    let query =
      "DELETE FROM categories where id = $1 and user_id = $2 RETURNING id";

    const result = await pool.query(query, [category_id, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error deleting category" });
  }
}
