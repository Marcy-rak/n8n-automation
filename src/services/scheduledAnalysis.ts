import config from '../config';
import { tradeAnalysisService } from './tradeAnalysisService';
import { notificationService } from './notificationService';
import { tradeRepository } from '../database/tradeRepository';
import { logger } from '../utils/logger';

/**
 * Scheduled Analysis Runner
 * Main function that runs every 30 minutes
 */
export async function runScheduledAnalysis(): Promise<void> {
  logger.info('=== Starting scheduled analysis ===');

  const symbols = config.trading.defaultSymbols;
  const timeframe = 'M30'; // 30-minute timeframe
  const results: any[] = [];

  for (const symbol of symbols) {
    try {
      logger.info(`Analyzing ${symbol}...`);

      // In production, you would fetch real market data
      // For now, we use a placeholder market summary
      const marketSummary = await getMarketSummary(symbol);

      // Run analysis with confidence filtering
      const result = await tradeAnalysisService.analyzeSymbol(
        symbol,
        timeframe,
        marketSummary
      );

      results.push({
        symbol,
        ...result,
      });

      // If trade was saved (confidence >= threshold), send notification
      if (result.tradeId) {
        const trade = await tradeRepository.getRecentTrades(symbol, 1);
        if (trade.length > 0) {
          await notificationService.notifyNewTrade(trade[0] as any);
        }
      } else {
        logger.info(`Trade not saved for ${symbol}`, {
          reason: result.status,
          confidence: result.confidence,
        });
      }

      // Add delay between API calls to avoid rate limits
      await sleep(2000);
    } catch (error: any) {
      logger.error(`Failed to analyze ${symbol}`, { error: error.message });
      results.push({
        symbol,
        status: 'ERROR',
        error: error.message,
      });
    }
  }

  // Log summary
  const saved = results.filter((r) => r.tradeId).length;
  const rejected = results.filter((r) => r.status === 'REJECTED_LOW_CONFIDENCE').length;
  const errors = results.filter((r) => r.status === 'ERROR').length;

  logger.info('=== Analysis complete ===', {
    total: symbols.length,
    saved,
    rejected,
    errors,
  });
}

/**
 * Get market summary for a symbol
 * TODO: Replace with real market data API
 */
async function getMarketSummary(symbol: string): Promise<string> {
  // Placeholder - in production, integrate with:
  // - TradingView API
  // - Yahoo Finance
  // - Alpha Vantage
  // - Your broker's API
  // - News sentiment API

  return `Current market conditions for ${symbol}. Price action showing consolidation. Volume is moderate. No major news events pending.`;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
