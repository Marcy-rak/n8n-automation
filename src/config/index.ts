import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface Config {
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  grok: {
    apiKey: string;
    apiUrl: string;
    model: string;
  };
  trading: {
    confidenceThreshold: number;
    schedulerIntervalMinutes: number;
    defaultSymbols: string[];
  };
  notifications: {
    email: {
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
      };
      from: string;
      to: string;
    };
    whatsapp: {
      enabled: boolean;
      twilioAccountSid?: string;
      twilioAuthToken?: string;
      from?: string;
      to?: string;
    };
  };
  openai: {
    apiKey: string;
    embeddingModel: string;
  };
  logging: {
    level: string;
    file: string;
  };
}

const config: Config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'trading_workflow',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  grok: {
    apiKey: process.env.GROK_API_KEY || '',
    apiUrl: process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions',
    model: process.env.GROK_MODEL || 'grok-beta',
  },
  trading: {
    confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.7'),
    schedulerIntervalMinutes: parseInt(process.env.SCHEDULER_INTERVAL_MINUTES || '30', 10),
    defaultSymbols: (process.env.DEFAULT_SYMBOLS || 'EURUSD,GBPUSD,USDJPY').split(','),
  },
  notifications: {
    email: {
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
      },
      from: process.env.EMAIL_FROM || '',
      to: process.env.EMAIL_TO || '',
    },
    whatsapp: {
      enabled: process.env.WHATSAPP_ENABLED === 'true',
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.TWILIO_WHATSAPP_TO,
    },
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/trading-workflow.log',
  },
};

// Validation function
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.database.password) {
    errors.push('DB_PASSWORD is required');
  }

  if (!config.grok.apiKey) {
    errors.push('GROK_API_KEY is required');
  }

  if (!config.openai.apiKey) {
    errors.push('OPENAI_API_KEY is required (for embeddings)');
  }

  if (config.trading.confidenceThreshold < 0 || config.trading.confidenceThreshold > 1) {
    errors.push('CONFIDENCE_THRESHOLD must be between 0 and 1');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

export default config;
