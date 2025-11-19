import 'dotenv/config';
import { startEmailSummaryScheduler } from './services/scheduledEmailSummary';
import logger from './utils/logger';
import { getPool } from './database/connection';

/**
 * Email Summary Scheduler Entry Point
 * Starts the scheduled email summarization service
 */

async function main() {
  try {
    logger.info('='.repeat(60));
    logger.info('EMAIL SUMMARY SCHEDULER STARTING');
    logger.info('='.repeat(60));

    // Test database connection
    const pool = getPool();
    await pool.query('SELECT NOW()');
    logger.info('✅ Database connection successful');

    // Start scheduler
    startEmailSummaryScheduler();

    logger.info('='.repeat(60));
    logger.info('📧 Email Summary Scheduler is running');
    logger.info('   Cron schedule: ' + (process.env.EMAIL_SUMMARY_CRON || '0 7 * * *'));
    logger.info('   Email label: ' + (process.env.EMAIL_LABEL || 'ToSummarize'));
    logger.info('   Recipient: ' + (process.env.EMAIL_RECIPIENT || process.env.SMTP_USER || 'Not configured'));
    logger.info('='.repeat(60));
    logger.info('Press Ctrl+C to stop');
  } catch (error) {
    logger.error('❌ Failed to start email summary scheduler:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('\n👋 Shutting down email summary scheduler...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('\n👋 Shutting down email summary scheduler...');
  process.exit(0);
});

main();
