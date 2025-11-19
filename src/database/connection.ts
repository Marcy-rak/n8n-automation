import { Pool, PoolClient, QueryResult } from 'pg';
import config from '../config';
import { logger } from '../utils/logger';

/**
 * PostgreSQL Connection Pool
 * Singleton pattern for database connections
 */
class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Pool error handler
    this.pool.on('error', (err) => {
      logger.error('Unexpected database pool error', { error: err });
    });

    logger.info('Database pool initialized', {
      host: config.database.host,
      database: config.database.database,
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Execute a query
   */
  public async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug('Query executed', { duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Database query error', { error, query: text });
      throw error;
    }
  }

  /**
   * Get a client from the pool (for transactions)
   */
  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Close all connections
   */
  public async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database pool closed');
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()');
      logger.info('Database connection test successful', { time: result.rows[0].now });
      return true;
    } catch (error) {
      logger.error('Database connection test failed', { error });
      return false;
    }
  }

  /**
   * Check if pgvector extension is installed
   */
  public async checkPgVector(): Promise<boolean> {
    try {
      const result = await this.query(
        "SELECT * FROM pg_extension WHERE extname = 'vector'"
      );
      if (result.rowCount === 0) {
        logger.warn('pgvector extension not found. Run: CREATE EXTENSION vector;');
        return false;
      }
      logger.info('pgvector extension is installed');
      return true;
    } catch (error) {
      logger.error('Error checking pgvector extension', { error });
      return false;
    }
  }
}

// Export singleton instance
export const db = Database.getInstance();
export default db;
