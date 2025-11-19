import axios from 'axios';
import config from '../config';
import { GrokTradeResponse, RAGContext } from '../models/TradeIdea';
import { logger } from '../utils/logger';

/**
 * Grok API Service
 * Handles communication with Grok AI for trade analysis
 */
export class GrokService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = config.grok.apiKey;
    this.apiUrl = config.grok.apiUrl;
    this.model = config.grok.model;
  }

  /**
   * Build prompt for Grok with RAG context
   */
  buildPrompt(
    symbol: string,
    timeframe: string,
    marketSummary: string,
    ragContext: string
  ): string {
    return `You are an expert forex trading analyst. Analyze the current market conditions and provide a trading recommendation.

**CURRENT MARKET:**
- Symbol: ${symbol}
- Timeframe: ${timeframe}
- Market Summary: ${marketSummary}

**HISTORICAL CONTEXT (Similar Past Trades):**
${ragContext}

**YOUR TASK:**
Based on the current market conditions and historical patterns, provide a trading recommendation.

**CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanation - just pure JSON.**

**REQUIRED JSON SCHEMA:**
{
  "symbol": "${symbol}",
  "timeframe": "${timeframe}",
  "direction": "LONG" | "SHORT" | "FLAT",
  "entry_price": <number>,
  "stop_loss": <number>,
  "take_profit": <number>,
  "confidence": <0.0 to 1.0>,
  "rationale": "<brief explanation>",
  "notes": "<optional risk factors or additional comments>"
}

**RULES:**
1. direction must be exactly "LONG", "SHORT", or "FLAT"
2. confidence must be between 0.0 and 1.0 (e.g., 0.75 for 75% confidence)
3. All prices must be realistic for ${symbol}
4. If market is unclear or risky, use "FLAT" and lower confidence
5. Base your analysis on technical patterns, sentiment, and historical outcomes
6. Consider win/loss patterns from historical context

**RESPOND WITH JSON ONLY:**`;
  }

  /**
   * Call Grok API with structured prompt
   */
  async analyzeMarket(
    symbol: string,
    timeframe: string,
    marketSummary: string,
    ragContext: string
  ): Promise<{ response: GrokTradeResponse; latencyMs: number }> {
    const startTime = Date.now();
    const prompt = this.buildPrompt(symbol, timeframe, marketSummary, ragContext);

    try {
      logger.info('Calling Grok API', { symbol, timeframe });

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a precise trading analyst. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const latencyMs = Date.now() - startTime;
      const content = response.data.choices[0].message.content;

      // Parse JSON response
      const tradeResponse = this.parseGrokResponse(content);

      logger.info('Grok API response received', {
        symbol,
        direction: tradeResponse.direction,
        confidence: tradeResponse.confidence,
        latencyMs,
      });

      return {
        response: tradeResponse,
        latencyMs,
      };
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      logger.error('Grok API error', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        latencyMs,
      });
      throw new Error(`Grok API failed: ${error.message}`);
    }
  }

  /**
   * Parse and validate Grok response
   */
  private parseGrokResponse(content: string): GrokTradeResponse {
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanContent);

      // Validate required fields
      this.validateTradeResponse(parsed);

      return parsed as GrokTradeResponse;
    } catch (error: any) {
      logger.error('Failed to parse Grok response', { content, error: error.message });
      throw new Error(`Invalid Grok response format: ${error.message}`);
    }
  }

  /**
   * Validate trade response structure
   */
  private validateTradeResponse(data: any): void {
    const required = [
      'symbol',
      'timeframe',
      'direction',
      'entry_price',
      'stop_loss',
      'take_profit',
      'confidence',
      'rationale',
    ];

    for (const field of required) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate direction
    if (!['LONG', 'SHORT', 'FLAT'].includes(data.direction)) {
      throw new Error(`Invalid direction: ${data.direction}`);
    }

    // Validate confidence
    if (data.confidence < 0 || data.confidence > 1) {
      throw new Error(`Confidence must be between 0 and 1, got: ${data.confidence}`);
    }

    // Validate numeric fields
    const numericFields = ['entry_price', 'stop_loss', 'take_profit'];
    for (const field of numericFields) {
      if (typeof data[field] !== 'number' || isNaN(data[field])) {
        throw new Error(`${field} must be a valid number`);
      }
    }
  }
}

export const grokService = new GrokService();
