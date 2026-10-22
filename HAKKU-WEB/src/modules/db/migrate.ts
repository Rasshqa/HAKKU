import fs from "fs";
import path from "path";
import { Pool } from "pg";

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not found in environment.");
    process.exit(1);
  }

  console.log("[Neon Migration] Connecting to Neon Lakebase Postgres...");
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log("[Neon Migration] Connected successfully!");

    const schemaPath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");

    console.log("[Neon Migration] Executing schema DDL...");
    await client.query(sql);

    console.log("[Neon Migration] All tables and indexes successfully created on Neon!");

    // Verifikasi tabel yang telah dibuat
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("[Neon Migration] Tables currently in database:");
    res.rows.forEach((r) => console.log(`  - ${r.table_name}`));

    client.release();
    await pool.end();
  } catch (err) {
    console.error("[Neon Migration] Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
