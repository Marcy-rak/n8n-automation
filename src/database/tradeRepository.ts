import { QueryResult } from 'pg';
import db from './connection';
import { TradeIdea, RAGContext } from '../models/TradeIdea';
import { logger } from '../utils/logger';

/**
 * Trade Repository
 * Handles all database operations for trade ideas
 */
export class TradeRepository {
  /**
   * Save a new trade idea to the database
   */
  async saveTradeIdea(trade: TradeIdea): Promise<number> {
    const query = `
      INSERT INTO trade_ideas (
        symbol, timeframe, direction, entry_price, stop_loss, take_profit,
        confidence, rationale, notes, embedding, raw_response
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector, $11)
      RETURNING id
    `;

    const values = [
      trade.symbol,
      trade.timeframe,
      trade.direction,
      trade.entry_price,
      trade.stop_loss,
      trade.take_profit,
      trade.confidence,
      trade.rationale,
      trade.notes || null,
      trade.embedding ? JSON.stringify(trade.embedding) : null,
      trade.raw_response ? JSON.stringify(trade.raw_response) : null,
    ];

    try {
      const result = await db.query<{ id: number }>(query, values);
      const tradeId = result.rows[0].id;
      logger.info('Trade idea saved', { tradeId, symbol: trade.symbol, confidence: trade.confidence });
      return tradeId;
    } catch (error) {
      logger.error('Error saving trade idea', { error, trade });
      throw error;
    }
  }

  /**
   * Find similar trades using pgvector similarity search
   */
  async findSimilarTrades(
    embedding: number[],
    symbol: string,
    limit: number = 5
  ): Promise<RAGContext[]> {
    const query = `
      SELECT
        id,
        symbol,
        timeframe,
        direction,
        confidence,
        rationale,
        is_win,
        created_at,
        (embedding <=> $1::vector) as similarity
      FROM trade_ideas
      WHERE
        symbol = $2
        AND embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $3
    `;

    try {
      const result = await db.query<RAGContext>(query, [
        JSON.stringify(embedding),
        symbol,
        limit,
      ]);

      logger.info('Similar trades found', { count: result.rowCount, symbol });
      return result.rows;
    } catch (error) {
      logger.error('Error finding similar trades', { error, symbol });
      throw error;
    }
  }

  /**
   * Get recent trades for a symbol (fallback if no embeddings)
   */
  async getRecentTrades(symbol: string, limit: number = 5): Promise<RAGContext[]> {
    const query = `
      SELECT
        id,
        symbol,
        timeframe,
        direction,
        confidence,
        rationale,
        is_win,
        created_at
      FROM trade_ideas
      WHERE symbol = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    try {
      const result = await db.query<RAGContext>(query, [symbol, limit]);
      logger.info('Recent trades retrieved', { count: result.rowCount, symbol });
      return result.rows;
    } catch (error) {
      logger.error('Error getting recent trades', { error, symbol });
      throw error;
    }
  }

  /**
   * Update trade outcome (is_win, actual_exit_price, pnl)
   */
  async updateTradeOutcome(
    tradeId: number,
    isWin: boolean,
    actualExitPrice: number,
    pnl: number
  ): Promise<void> {
    const query = `
      UPDATE trade_ideas
      SET
        is_win = $1,
        actual_exit_price = $2,
        pnl = $3,
        evaluated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `;

    try {
      await db.query(query, [isWin, actualExitPrice, pnl, tradeId]);
      logger.info('Trade outcome updated', { tradeId, isWin, pnl });
    } catch (error) {
      logger.error('Error updating trade outcome', { error, tradeId });
      throw error;
    }
  }

  /**
   * Get unevaluated trades (for outcome checking)
   */
  async getUnevaluatedTrades(): Promise<TradeIdea[]> {
    const query = `
      SELECT *
      FROM trade_ideas
      WHERE is_win IS NULL
        AND created_at < NOW() - INTERVAL '1 day'
      ORDER BY created_at ASC
    `;

    try {
      const result = await db.query<TradeIdea>(query);
      logger.info('Unevaluated trades found', { count: result.rowCount });
      return result.rows;
    } catch (error) {
      logger.error('Error getting unevaluated trades', { error });
      throw error;
    }
  }

  /**
   * Get trade statistics by symbol
   */
  async getTradeStats(symbol?: string): Promise<any[]> {
    const query = symbol
      ? `
        SELECT
          symbol,
          COUNT(*) as total_trades,
          SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN is_win = FALSE THEN 1 ELSE 0 END) as losses,
          ROUND(AVG(CASE WHEN is_win = TRUE THEN 1.0 ELSE 0.0 END) * 100, 2) as win_rate,
          ROUND(AVG(confidence)::numeric, 3) as avg_confidence,
          SUM(COALESCE(pnl, 0)) as total_pnl
        FROM trade_ideas
        WHERE symbol = $1 AND is_win IS NOT NULL
        GROUP BY symbol
      `
      : `
        SELECT
          symbol,
          COUNT(*) as total_trades,
          SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN is_win = FALSE THEN 1 ELSE 0 END) as losses,
          ROUND(AVG(CASE WHEN is_win = TRUE THEN 1.0 ELSE 0.0 END) * 100, 2) as win_rate,
          ROUND(AVG(confidence)::numeric, 3) as avg_confidence,
          SUM(COALESCE(pnl, 0)) as total_pnl
        FROM trade_ideas
        WHERE is_win IS NOT NULL
        GROUP BY symbol
        ORDER BY total_trades DESC
      `;

    try {
      const result = symbol
        ? await db.query(query, [symbol])
        : await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting trade stats', { error, symbol });
      throw error;
    }
  }
}

export const tradeRepository = new TradeRepository();
