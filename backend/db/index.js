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
    console.error("❌ Failed to initialize database:", err.message);
    process.exit(1);
  }
};

module.exports = { pool, initDB };