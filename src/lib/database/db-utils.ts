import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Create a new pool for migrations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function runMigrations() {
  const db = drizzle(pool);
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: 'src/lib/database/migrations' });
  console.log('Migrations completed!');
  await pool.end();
}
