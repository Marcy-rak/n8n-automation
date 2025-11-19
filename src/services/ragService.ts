import { tradeRepository } from '../database/tradeRepository';
import { embeddingService } from './embeddingService';
import { RAGContext } from '../models/TradeIdea';
import { logger } from '../utils/logger';

/**
 * RAG Service
 * Retrieves relevant historical context for Grok prompts
 */
export class RAGService {
  /**
   * Get RAG context for a trading analysis
   * Uses vector similarity search to find relevant past trades
   */
  async getRelevantContext(
    symbol: string,
    marketSummary: string,
    limit: number = 5
  ): Promise<RAGContext[]> {
    try {
      // Generate embedding for the current market context
      const queryText = `Symbol: ${symbol}. Market: ${marketSummary}`;
      const embedding = await embeddingService.generateEmbedding(queryText);

      // Search for similar past trades
      const similarTrades = await tradeRepository.findSimilarTrades(
        embedding,
        symbol,
        limit
      );

      logger.info('RAG context retrieved', {
        symbol,
        contextCount: similarTrades.length,
      });

      return similarTrades;
    } catch (error) {
      logger.warn('Error getting RAG context, falling back to recent trades', { error });
      // Fallback to recent trades if embedding fails
      return await tradeRepository.getRecentTrades(symbol, limit);
    }
  }

  /**
   * Format RAG context for prompt inclusion
   */
  formatContextForPrompt(contexts: RAGContext[]): string {
    if (contexts.length === 0) {
      return 'No historical context available.';
    }

    const formatted = contexts.map((ctx, idx) => {
      const outcome = ctx.is_win === true ? '✓ WIN' : ctx.is_win === false ? '✗ LOSS' : '⏳ PENDING';
      const similarity = ctx.similarity !== undefined ? ` (similarity: ${ctx.similarity.toFixed(3)})` : '';

      return `
${idx + 1}. [${ctx.created_at.toISOString().split('T')[0]}] ${ctx.symbol} ${ctx.timeframe} - ${ctx.direction} ${outcome}${similarity}
   Confidence: ${(ctx.confidence * 100).toFixed(1)}%
   Rationale: ${ctx.rationale}
`.trim();
    });

    return formatted.join('\n\n');
  }
}

export const ragService = new RAGService();
