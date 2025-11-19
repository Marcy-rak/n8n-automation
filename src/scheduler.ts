import cron from 'node-cron';
import config, { validateConfig } from './config';
import db from './database/connection';
import { runScheduledAnalysis } from './services/scheduledAnalysis';
import { logger } from './utils/logger';

/**
 * Main Scheduler Entry Point
 * Runs trade analysis every 30 minutes
 */
async function startScheduler(): Promise<void> {
  logger.info('🚀 Starting Automated Trading Workflow Scheduler');

  try {
    // Validate configuration
    validateConfig();
    logger.info('✅ Configuration validated');

    // Test database connection
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Check pgvector extension
    await db.checkPgVector();

    logger.info(`📅 Scheduler interval: ${config.trading.schedulerIntervalMinutes} minutes`);
    logger.info(`🎯 Confidence threshold: ${config.trading.confidenceThreshold}`);
    logger.info(`📊 Symbols: ${config.trading.defaultSymbols.join(', ')}`);

    // Run once immediately on startup
    logger.info('▶️  Running initial analysis...');
    await runScheduledAnalysis();

    // Schedule recurring runs
    // Every 30 minutes: '*/30 * * * *'
    const cronExpression = `*/${config.trading.schedulerIntervalMinutes} * * * *`;

    cron.schedule(cronExpression, async () => {
      try {
        await runScheduledAnalysis();
      } catch (error: any) {
        logger.error('Scheduled analysis failed', { error: error.message });
      }
    });

    logger.info(`✅ Scheduler started with cron: ${cronExpression}`);
    logger.info('⏰ Next run in 30 minutes...');
  } catch (error: any) {
    logger.error('Failed to start scheduler', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await db.close();
  process.exit(0);
});

// Start the scheduler
startScheduler().catch((error) => {
  logger.error('Fatal error', { error });
  process.exit(1);
});
