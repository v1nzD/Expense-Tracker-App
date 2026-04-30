import pool from "../config/db.js";

const DEFAULT_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health & Medical",
  "Utilities",
  "Housing",
  "Travel",
  "Education",
  "Other",
];

/**
 * GET /api/categories
 * Returns all categories belonging to the authenticated user.
 */
export async function getCategories(req, res) {
  try {
    const user_id = req.user.id;

    let query =
      "SELECT id, name FROM categories WHERE id = $1 ORDER BY name ASC";

    const result = await pool.query(query, [user_id]);

    return res.status(200).json(result.rows);
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
      "DELETE FROM categories where id = $1 and category_id = $2 RETURNING id";

    const result = await pool.query(query, [user_id, category_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error deleting category" });
  }
}

/**
 * POST /api/categories/seed
 * Seeds the default categories for the authenticated user (idempotent — skips duplicates).
 * Call this once after a user registers.
 */

export async function seedDefaultCategories(req, res) {
  try {
    const { user_id } = req.user.id;

    // INSERT ... ON CONFLICT DO NOTHING makes this safe to call multiple times
    const values = DEFAULT_CATEGORIES.map(
      (_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`,
    ).join(", ");

    const params = DEFAULT_CATEGORIES.flatMap((name) => [name, user_id]);

    await pool.query(
      `INSERT INTO categories (name, user_id) VALUES ${values} ON CONFLICT (user_id, name) DO NOTHING`,
      params,
    );

    let query =
      "SELECT id, name FROM categories WHERE user_id = $1 ORDER BY name ASC";

    const result = await pool.query(query, [user_id]);

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error seeding categories" });
  }
}
