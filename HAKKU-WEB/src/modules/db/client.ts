import { Pool } from "pg";

let pool: Pool | null = null;

export function getDatabasePool(): Pool | null {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (
    !databaseUrl ||
    databaseUrl === "your_database_url_here" ||
    (databaseUrl.includes("localhost:5432/hakku_db") &&
      process.env.NODE_ENV !== "production")
  ) {
    return null;
  }

  if (!pool && databaseUrl) {
    try {
      const isRemote =
        databaseUrl.includes("neon.tech") ||
        databaseUrl.includes("supabase.co") ||
        databaseUrl.includes("aws") ||
        databaseUrl.includes("sslmode=require");

      pool = new Pool({
        connectionString: databaseUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 3000,
        ssl: isRemote ? { rejectUnauthorized: false } : undefined,
      });

      pool.on("error", (err) => {
        console.warn("[HAKKU DB] Unexpected PostgreSQL client pool error:", err.message);
      });
    } catch (err) {
      console.warn("[HAKKU DB] Failed to initialize PostgreSQL pool:", err);
      pool = null;
    }
  }

  return pool;
}

export async function testDatabaseConnection(): Promise<boolean> {
  const activePool = getDatabasePool();
  if (!activePool) return false;

  try {
    const client = await activePool.connect();
    try {
      await client.query("SELECT 1");
      return true;
    } finally {
      client.release();
    }
  } catch {
    return false;
  }
}
