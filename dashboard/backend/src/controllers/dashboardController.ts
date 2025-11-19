import { Request, Response } from 'express';
import pool from '../db/connection';

export class DashboardController {
  /**
   * Get overview statistics
   */
  async getOverview(req: Request, res: Response) {
    try {
      const query = `
        SELECT
          COUNT(*) as total_trades,
          SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END) as total_wins,
          SUM(CASE WHEN is_win = FALSE THEN 1 ELSE 0 END) as total_losses,
          SUM(CASE WHEN is_win IS NULL THEN 1 ELSE 0 END) as pending_trades,
          ROUND(AVG(CASE WHEN is_win = TRUE THEN 1.0 ELSE 0.0 END) * 100, 2) as win_rate,
          ROUND(AVG(confidence)::numeric * 100, 2) as avg_confidence,
          ROUND(SUM(COALESCE(pnl, 0))::numeric, 2) as total_pnl,
          MAX(created_at) as last_trade_date
        FROM trade_ideas
        WHERE is_win IS NOT NULL
      `;

      const result = await pool.query(query);
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Error getting overview:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get recent trades
   */
  async getRecentTrades(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      const query = `
        SELECT
          id,
          symbol,
          timeframe,
          direction,
          entry_price,
          stop_loss,
          take_profit,
          confidence,
          rationale,
          is_win,
          actual_exit_price,
          pnl,
          created_at,
          evaluated_at
        FROM trade_ideas
        ORDER BY created_at DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);
      res.json(result.rows);
    } catch (error: any) {
      console.error('Error getting recent trades:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get performance by symbol
   */
  async getPerformanceBySymbol(req: Request, res: Response) {
    try {
      const query = `
        SELECT
          symbol,
          COUNT(*) as total_trades,
          SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN is_win = FALSE THEN 1 ELSE 0 END) as losses,
          ROUND(AVG(CASE WHEN is_win = TRUE THEN 1.0 ELSE 0.0 END) * 100, 2) as win_rate,
          ROUND(SUM(COALESCE(pnl, 0))::numeric, 2) as total_pnl,
          ROUND(AVG(confidence)::numeric * 100, 2) as avg_confidence
        FROM trade_ideas
        WHERE is_win IS NOT NULL
        GROUP BY symbol
        ORDER BY total_trades DESC
      `;

      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error: any) {
      console.error('Error getting performance by symbol:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get win rate over time (daily)
   */
  async getWinRateOverTime(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;

      const query = `
        SELECT
          DATE(evaluated_at) as date,
          COUNT(*) as total_trades,
          SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END) as wins,
          ROUND(AVG(CASE WHEN is_win = TRUE THEN 1.0 ELSE 0.0 END) * 100, 2) as win_rate,
          ROUND(SUM(COALESCE(pnl, 0))::numeric, 2) as daily_pnl
        FROM trade_ideas
        WHERE is_win IS NOT NULL
          AND evaluated_at > CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(evaluated_at)
        ORDER BY DATE(evaluated_at) ASC
      `;

      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error: any) {
      console.error('Error getting win rate over time:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get confidence distribution
   */
  async getConfidenceDistribution(req: Request, res: Response) {
    try {
      const query = `
        SELECT
          CASE
            WHEN confidence < 0.7 THEN '< 70%'
            WHEN confidence >= 0.7 AND confidence < 0.8 THEN '70-80%'
            WHEN confidence >= 0.8 AND confidence < 0.9 THEN '80-90%'
            ELSE '90%+'
          END as confidence_range,
          COUNT(*) as count,
          ROUND(AVG(CASE WHEN is_win = TRUE THEN 1.0 ELSE 0.0 END) * 100, 2) as win_rate
        FROM trade_ideas
        WHERE is_win IS NOT NULL
        GROUP BY confidence_range
        ORDER BY confidence_range
      `;

      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error: any) {
      console.error('Error getting confidence distribution:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get workflow status (analysis logs)
   */
  async getWorkflowStatus(req: Request, res: Response) {
    try {
      const query = `
        SELECT
          status,
          COUNT(*) as count,
          MAX(run_timestamp) as last_run
        FROM analysis_logs
        WHERE run_timestamp > NOW() - INTERVAL '7 days'
        GROUP BY status
      `;

      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error: any) {
      console.error('Error getting workflow status:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get P&L chart data
   */
  async getPnlChart(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;

      const query = `
        SELECT
          DATE(evaluated_at) as date,
          SUM(COALESCE(pnl, 0)) OVER (ORDER BY DATE(evaluated_at)) as cumulative_pnl,
          SUM(COALESCE(pnl, 0)) as daily_pnl
        FROM trade_ideas
        WHERE is_win IS NOT NULL
          AND evaluated_at > CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(evaluated_at)
        ORDER BY DATE(evaluated_at) ASC
      `;

      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error: any) {
      console.error('Error getting P&L chart:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get trade details by ID
   */
  async getTradeDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const query = `
        SELECT *
        FROM trade_ideas
        WHERE id = $1
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Trade not found' });
      }

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Error getting trade details:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new DashboardController();
