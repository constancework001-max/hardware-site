const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initDB = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log("✅ Database initialized successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);

    // ❗ DO NOT crash app (important for Render)
    console.log("⚠️ Server will still start, retrying later...");
  }
};

module.exports = { pool, initDB };