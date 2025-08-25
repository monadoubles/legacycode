export const DATABASE_CONFIG = {
  connection: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'legacy_code_analyzer',
    username: process.env.DB_USER || 'analyzer_user',
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
  },
  
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
    createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT || '30000'),
    destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT || '5000'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000'),
    createRetryIntervalMillis: parseInt(process.env.DB_RETRY_INTERVAL || '200'),
  },
  
  features: {
    enableQueryLogging: process.env.ENABLE_QUERY_LOGGING === 'true',
    enableSlowQueryLogging: process.env.ENABLE_SLOW_QUERY_LOG === 'true',
    slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000'),
    enableMigrations: process.env.ENABLE_MIGRATIONS !== 'false',
    enableSeeding: process.env.ENABLE_SEEDING === 'true',
  },
  
  migrations: {
    directory: './src/lib/database/migrations',
    tableName: 'knex_migrations',
    extension: 'sql',
  },
  
  backups: {
    enabled: process.env.ENABLE_DB_BACKUPS === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    retention: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    destination: process.env.BACKUP_DESTINATION || './backups',
  }
};

export const validateDatabaseConfig = () => {
  if (!DATABASE_CONFIG.connection.url && !DATABASE_CONFIG.connection.host) {
    throw new Error('Database configuration missing: either DATABASE_URL or DB_HOST must be provided');
  }
  
  if (!DATABASE_CONFIG.connection.password) {
    console.warn('Database password not configured, connection may fail');
  }
  
  return true;
};
