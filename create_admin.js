const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
const pool = new Pool({ connectionString });

async function main() {
  const hash = await bcrypt.hash("password123", 10);
  const res = await pool.query(
    "INSERT INTO \"User\" (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING RETURNING *",
    ["123e4567-e89b-12d3-a456-426614174000", "Admin User", "admin@news.com", hash, "ADMIN"]
  );
  if (res.rowCount > 0) {
    console.log("Created admin user: admin@news.com / password123");
  } else {
    console.log("Admin user already exists.");
  }
}

main().catch(console.error).finally(() => pool.end());
