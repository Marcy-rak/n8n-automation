import cron from 'node-cron';
import { getPool } from '../database/connection';
import EmailSummaryService from './emailSummaryService';
import logger from '../utils/logger';
import config from '../config';

/**
 * Scheduled Email Summary
 * Runs email summary workflow on a cron schedule
 */

let emailSummaryService: EmailSummaryService;

/**
 * Initialize email summary service
 */
function initService() {
  if (!emailSummaryService) {
    const pool = getPool();
    emailSummaryService = new EmailSummaryService(pool);
  }
  return emailSummaryService;
}

/**
 * Run scheduled email summary
 */
export async function runScheduledEmailSummary(): Promise<void> {
  try {
    logger.info('🔔 Scheduled email summary triggered');

    const service = initService();

    // Get configuration from environment
    const labelName = process.env.EMAIL_LABEL || 'ToSummarize';
    const recipientEmail = process.env.EMAIL_RECIPIENT || process.env.SMTP_USER || '';
    const confidenceThreshold = parseFloat(process.env.EMAIL_CONFIDENCE_THRESHOLD || '0.6');

    if (!recipientEmail) {
      logger.error('No recipient email configured (EMAIL_RECIPIENT or SMTP_USER)');
      return;
    }

    // Run workflow
    const result = await service.runEmailSummaryWorkflow(labelName, recipientEmail, confidenceThreshold);

    if (result) {
      logger.info(`✅ Email summary completed: ${result.totalEmails} emails, confidence: ${result.confidence}`);
    } else {
      logger.info('ℹ️ No email summary generated (no emails or low confidence)');
    }
  } catch (error) {
    logger.error('❌ Error in scheduled email summary:', error);
  }
}

/**
 * Start email summary scheduler
 */
export function startEmailSummaryScheduler(): void {
  // Get cron expression from environment (default: every day at 7 AM)
  const cronExpression = process.env.EMAIL_SUMMARY_CRON || '0 7 * * *';

  logger.info(`📅 Starting email summary scheduler with cron: ${cronExpression}`);

  cron.schedule(cronExpression, async () => {
    await runScheduledEmailSummary();
  });

  logger.info('✅ Email summary scheduler started');

  // Run once immediately on startup (optional, uncomment if desired)
  // setTimeout(() => runScheduledEmailSummary(), 5000);
}

/**
 * Stop all schedulers (for graceful shutdown)
 */
export function stopEmailSummaryScheduler(): void {
  logger.info('Stopping email summary scheduler...');
  // cron.destroy() if needed
}
