import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/database/models/index.ts',
  out: './src/lib/database/migrations',
  dialect: 'postgresql',  // Use dialect instead of driver
  dbCredentials: {
    // Using standard PostgreSQL connection string
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || "admin",
    database: process.env.DATABASE_NAME || "legacy_code_analyzer",
    ssl: process.env.NODE_ENV === 'production'
  },
  verbose: true,
  strict: true,
} satisfies Config;
