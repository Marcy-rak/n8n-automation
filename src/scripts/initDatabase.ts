import fs from 'fs';
import path from 'path';
import db from '../database/connection';
import { logger } from '../utils/logger';

/**
 * Database Initialization Script
 * Runs the schema.sql file to create tables and extensions
 */
async function initDatabase(): Promise<void> {
  logger.info('🗄️  Initializing database...');

  try {
    // Test connection
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Read schema file
    const schemaPath = path.resolve(__dirname, '../../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    logger.info('📄 Running schema.sql...');

    // Execute schema
    await db.query(schema);

    logger.info('✅ Database initialized successfully');

    // Verify pgvector
    await db.checkPgVector();

    // Show table counts
    const tables = ['trade_ideas', 'analysis_logs', 'market_context'];
    for (const table of tables) {
      const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
      logger.info(`📊 ${table}: ${result.rows[0].count} rows`);
    }

    await db.close();
    process.exit(0);
  } catch (error: any) {
    logger.error('Database initialization failed', { error: error.message });
    process.exit(1);
  }
}

initDatabase();
