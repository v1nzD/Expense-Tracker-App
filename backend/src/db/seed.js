// seed.js
import pool from "./config/db.js";

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

async function seed() {
  try {
    const values = DEFAULT_CATEGORIES.map((_, i) => `($${i + 1}, NULL)`).join(
      ", ",
    );
    const params = DEFAULT_CATEGORIES;

    await pool.query(
      `INSERT INTO categories (name, user_id) VALUES ${values} ON CONFLICT (user_id, name) DO NOTHING`,
      params,
    );

    console.log("✅ Default categories seeded successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await pool.end();
  }
}

seed();
