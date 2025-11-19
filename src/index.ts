/**
 * Automated Trading Workflow
 * Main entry point for running analysis on-demand
 */

import config, { validateConfig } from './config';
import db from './database/connection';
import { runScheduledAnalysis } from './services/scheduledAnalysis';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  logger.info('🚀 Automated Trading Workflow - Manual Run');

  try {
    // Validate configuration
    validateConfig();

    // Test database connection
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Run analysis
    await runScheduledAnalysis();

    logger.info('✅ Analysis complete');
    await db.close();
    process.exit(0);
  } catch (error: any) {
    logger.error('Fatal error', { error: error.message, stack: error.stack });
    await db.close();
    process.exit(1);
  }
}

main();
