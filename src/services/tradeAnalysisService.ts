import config from '../config';
import { grokService } from './grokService';
import { ragService } from './ragService';
import { embeddingService } from './embeddingService';
import { tradeRepository } from '../database/tradeRepository';
import { analysisLogRepository } from '../database/analysisLogRepository';
import { TradeIdea, AnalysisLog } from '../models/TradeIdea';
import { logger } from '../utils/logger';

/**
 * Trade Analysis Service
 * Orchestrates the complete analysis workflow with confidence filtering
 */
export class TradeAnalysisService {
  private confidenceThreshold: number;

  constructor() {
    this.confidenceThreshold = config.trading.confidenceThreshold;
  }

  /**
   * Run complete analysis for a symbol
   * Returns trade ID if saved, null if rejected
   */
  async analyzeSymbol(
    symbol: string,
    timeframe: string,
    marketSummary: string
  ): Promise<{ tradeId: number | null; confidence: number; status: string }> {
    logger.info('Starting trade analysis', { symbol, timeframe });

    const analysisLog: AnalysisLog = {
      status: 'ERROR',
      confidence_threshold: this.confidenceThreshold,
    };

    try {
      // Step 1: Get RAG context
      const ragContexts = await ragService.getRelevantContext(symbol, marketSummary);
      const formattedContext = ragService.formatContextForPrompt(ragContexts);
      analysisLog.rag_context_count = ragContexts.length;

      // Step 2: Build prompt and call Grok
      const { response, latencyMs } = await grokService.analyzeMarket(
        symbol,
        timeframe,
        marketSummary,
        formattedContext
      );

      analysisLog.api_latency_ms = latencyMs;
      analysisLog.grok_response = response;
      analysisLog.confidence = response.confidence;

      // Step 3: Apply confidence threshold
      if (response.confidence < this.confidenceThreshold) {
        logger.warn('Trade rejected - confidence below threshold', {
          symbol,
          confidence: response.confidence,
          threshold: this.confidenceThreshold,
        });

        analysisLog.status = 'REJECTED_LOW_CONFIDENCE';
        await analysisLogRepository.logAnalysis(analysisLog);

        return {
          tradeId: null,
          confidence: response.confidence,
          status: 'REJECTED_LOW_CONFIDENCE',
        };
      }

      // Step 4: Generate embedding for RAG
      const embeddingText = embeddingService.createTradeEmbeddingText(
        response.symbol,
        response.timeframe,
        response.direction,
        response.rationale
      );
      const embedding = await embeddingService.generateEmbedding(embeddingText);

      // Step 5: Save to database
      const tradeIdea: TradeIdea = {
        symbol: response.symbol,
        timeframe: response.timeframe,
        direction: response.direction,
        entry_price: response.entry_price,
        stop_loss: response.stop_loss,
        take_profit: response.take_profit,
        confidence: response.confidence,
        rationale: response.rationale,
        notes: response.notes,
        embedding,
        raw_response: response,
      };

      const tradeId = await tradeRepository.saveTradeIdea(tradeIdea);

      // Step 6: Log success
      analysisLog.status = 'SUCCESS';
      analysisLog.trade_idea_id = tradeId;
      await analysisLogRepository.logAnalysis(analysisLog);

      logger.info('Trade analysis completed successfully', {
        tradeId,
        symbol,
        confidence: response.confidence,
      });

      return {
        tradeId,
        confidence: response.confidence,
        status: 'SUCCESS',
      };
    } catch (error: any) {
      logger.error('Trade analysis failed', { symbol, error: error.message });

      analysisLog.status = 'ERROR';
      analysisLog.error_message = error.message;
      await analysisLogRepository.logAnalysis(analysisLog);

      throw error;
    }
  }

  /**
   * Get current confidence threshold
   */
  getConfidenceThreshold(): number {
    return this.confidenceThreshold;
  }
}

export const tradeAnalysisService = new TradeAnalysisService();
