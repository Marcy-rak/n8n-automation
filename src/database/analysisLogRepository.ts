import db from './connection';
import { AnalysisLog } from '../models/TradeIdea';
import { logger } from '../utils/logger';

/**
 * Analysis Log Repository
 * Handles logging of all analysis runs
 */
export class AnalysisLogRepository {
  /**
   * Log an analysis run
   */
  async logAnalysis(log: AnalysisLog): Promise<number> {
    const query = `
      INSERT INTO analysis_logs (
        status, trade_idea_id, confidence, confidence_threshold,
        prompt_text, grok_response, error_message, api_latency_ms, rag_context_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const values = [
      log.status,
      log.trade_idea_id || null,
      log.confidence || null,
      log.confidence_threshold || null,
      log.prompt_text || null,
      log.grok_response ? JSON.stringify(log.grok_response) : null,
      log.error_message || null,
      log.api_latency_ms || null,
      log.rag_context_count || null,
    ];

    try {
      const result = await db.query<{ id: number }>(query, values);
      const logId = result.rows[0].id;
      logger.debug('Analysis logged', { logId, status: log.status });
      return logId;
    } catch (error) {
      logger.error('Error logging analysis', { error, log });
      throw error;
    }
  }

  /**
   * Get recent analysis logs
   */
  async getRecentLogs(limit: number = 20): Promise<AnalysisLog[]> {
    const query = `
      SELECT *
      FROM analysis_logs
      ORDER BY run_timestamp DESC
      LIMIT $1
    `;

    try {
      const result = await db.query<AnalysisLog>(query, [limit]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting recent logs', { error });
      throw error;
    }
  }

  /**
   * Get analysis statistics
   */
  async getAnalysisStats(): Promise<any> {
    const query = `
      SELECT
        COUNT(*) as total_runs,
        SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'REJECTED_LOW_CONFIDENCE' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'ERROR' THEN 1 ELSE 0 END) as errors,
        ROUND(AVG(confidence)::numeric, 3) as avg_confidence,
        ROUND(AVG(api_latency_ms)::numeric, 0) as avg_latency_ms
      FROM analysis_logs
      WHERE run_timestamp > NOW() - INTERVAL '7 days'
    `;

    try {
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting analysis stats', { error });
      throw error;
    }
  }
}

export const analysisLogRepository = new AnalysisLogRepository();
