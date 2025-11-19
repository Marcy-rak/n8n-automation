import axios from 'axios';
import config from '../config';
import { logger } from '../utils/logger';

/**
 * Embedding Service
 * Generates embeddings using OpenAI API for RAG similarity search
 */
export class EmbeddingService {
  private apiKey: string;
  private model: string;
  private apiUrl: string = 'https://api.openai.com/v1/embeddings';

  constructor() {
    this.apiKey = config.openai.apiKey;
    this.model = config.openai.embeddingModel;
  }

  /**
   * Generate embedding for a text string
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          input: text,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      const embedding = response.data.data[0].embedding;
      logger.debug('Embedding generated', { textLength: text.length, embeddingDim: embedding.length });
      return embedding;
    } catch (error: any) {
      logger.error('Error generating embedding', {
        error: error.message,
        status: error.response?.status,
      });
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Create embedding text from trade idea
   * Combines key information for semantic search
   */
  createTradeEmbeddingText(
    symbol: string,
    timeframe: string,
    direction: string,
    rationale: string
  ): string {
    return `Symbol: ${symbol}, Timeframe: ${timeframe}, Direction: ${direction}. ${rationale}`;
  }
}

export const embeddingService = new EmbeddingService();
