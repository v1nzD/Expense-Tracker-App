import pkg from "pg";
import { ENV } from "./env.js";
const { Pool } = pkg;

const pool = new Pool({
  user: ENV.DB_USER,
  host: ENV.DB_HOST,
  database: ENV.DB_NAME,
  password: String(ENV.DB_PASSWORD),
  port: ENV.DB_PORT,
});

export default pool;
