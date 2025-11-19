import nodemailer, { Transporter } from 'nodemailer';
import axios from 'axios';
import config from '../config';
import { TradeIdea } from '../models/TradeIdea';
import { logger } from '../utils/logger';

/**
 * Notification Service
 * Sends trade alerts via Email and WhatsApp
 */
export class NotificationService {
  private emailTransporter: Transporter | null = null;

  constructor() {
    this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter
   */
  private initializeEmailTransporter(): void {
    if (!config.notifications.email.smtp.user || !config.notifications.email.smtp.password) {
      logger.warn('Email credentials not configured, email notifications disabled');
      return;
    }

    try {
      this.emailTransporter = nodemailer.createTransport({
        host: config.notifications.email.smtp.host,
        port: config.notifications.email.smtp.port,
        secure: config.notifications.email.smtp.secure,
        auth: {
          user: config.notifications.email.smtp.user,
          pass: config.notifications.email.smtp.password,
        },
      });

      logger.info('Email transporter initialized');
    } catch (error) {
      logger.error('Failed to initialize email transporter', { error });
    }
  }

  /**
   * Send notification for a new trade signal
   */
  async notifyNewTrade(trade: TradeIdea): Promise<void> {
    const notifications: Promise<void>[] = [];

    // Send email notification
    if (this.emailTransporter) {
      notifications.push(this.sendEmailNotification(trade));
    }

    // Send WhatsApp notification
    if (config.notifications.whatsapp.enabled) {
      notifications.push(this.sendWhatsAppNotification(trade));
    }

    if (notifications.length === 0) {
      logger.warn('No notification channels configured');
      return;
    }

    try {
      await Promise.allSettled(notifications);
      logger.info('Notifications sent', { tradeId: trade.id, symbol: trade.symbol });
    } catch (error) {
      logger.error('Error sending notifications', { error });
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(trade: TradeIdea): Promise<void> {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not initialized');
    }

    const subject = `🚨 New Trade Signal: ${trade.symbol} ${trade.direction}`;
    const html = this.buildEmailHTML(trade);

    try {
      await this.emailTransporter.sendMail({
        from: config.notifications.email.from,
        to: config.notifications.email.to,
        subject,
        html,
      });

      logger.info('Email notification sent', { tradeId: trade.id });
    } catch (error: any) {
      logger.error('Failed to send email', { error: error.message });
      throw error;
    }
  }

  /**
   * Build HTML email content
   */
  private buildEmailHTML(trade: TradeIdea): string {
    const directionEmoji = trade.direction === 'LONG' ? '📈' : trade.direction === 'SHORT' ? '📉' : '⏸️';
    const confidencePercent = (trade.confidence * 100).toFixed(1);
    const riskReward = this.calculateRiskReward(trade);

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
    .container { background-color: white; border-radius: 8px; padding: 20px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background-color: #1a73e8; color: white; padding: 15px; border-radius: 5px; text-align: center; }
    .trade-info { margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .label { font-weight: bold; color: #555; }
    .value { color: #333; }
    .direction-long { color: #0f9d58; font-weight: bold; }
    .direction-short { color: #db4437; font-weight: bold; }
    .confidence { font-size: 24px; font-weight: bold; color: #1a73e8; }
    .rationale { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #1a73e8; margin: 15px 0; }
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${directionEmoji} New Trade Signal</h2>
    </div>

    <div class="trade-info">
      <div class="info-row">
        <span class="label">Symbol:</span>
        <span class="value"><strong>${trade.symbol}</strong></span>
      </div>
      <div class="info-row">
        <span class="label">Direction:</span>
        <span class="value direction-${trade.direction.toLowerCase()}">${trade.direction}</span>
      </div>
      <div class="info-row">
        <span class="label">Timeframe:</span>
        <span class="value">${trade.timeframe}</span>
      </div>
      <div class="info-row">
        <span class="label">Entry Price:</span>
        <span class="value">${trade.entry_price.toFixed(5)}</span>
      </div>
      <div class="info-row">
        <span class="label">Stop Loss:</span>
        <span class="value">${trade.stop_loss.toFixed(5)}</span>
      </div>
      <div class="info-row">
        <span class="label">Take Profit:</span>
        <span class="value">${trade.take_profit.toFixed(5)}</span>
      </div>
      <div class="info-row">
        <span class="label">Risk/Reward:</span>
        <span class="value">${riskReward}</span>
      </div>
      <div class="info-row">
        <span class="label">Confidence:</span>
        <span class="confidence">${confidencePercent}%</span>
      </div>
    </div>

    <div class="rationale">
      <strong>Analysis:</strong><br>
      ${trade.rationale}
      ${trade.notes ? `<br><br><strong>Notes:</strong> ${trade.notes}` : ''}
    </div>

    <div class="footer">
      <p>Automated Trading Workflow | ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send WhatsApp notification (using Twilio)
   */
  private async sendWhatsAppNotification(trade: TradeIdea): Promise<void> {
    const { twilioAccountSid, twilioAuthToken, from, to } = config.notifications.whatsapp;

    if (!twilioAccountSid || !twilioAuthToken || !from || !to) {
      throw new Error('WhatsApp configuration incomplete');
    }

    const message = this.buildWhatsAppMessage(trade);
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

    try {
      await axios.post(
        url,
        new URLSearchParams({
          From: from,
          To: to,
          Body: message,
        }),
        {
          auth: {
            username: twilioAccountSid,
            password: twilioAuthToken,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      logger.info('WhatsApp notification sent', { tradeId: trade.id });
    } catch (error: any) {
      logger.error('Failed to send WhatsApp message', { error: error.message });
      throw error;
    }
  }

  /**
   * Build WhatsApp message text
   */
  private buildWhatsAppMessage(trade: TradeIdea): string {
    const directionEmoji = trade.direction === 'LONG' ? '📈' : trade.direction === 'SHORT' ? '📉' : '⏸️';
    const confidencePercent = (trade.confidence * 100).toFixed(1);
    const riskReward = this.calculateRiskReward(trade);

    return `
🚨 *NEW TRADE SIGNAL*

${directionEmoji} *${trade.symbol}* - ${trade.direction}
⏰ ${trade.timeframe}

💰 Entry: ${trade.entry_price.toFixed(5)}
🛑 Stop Loss: ${trade.stop_loss.toFixed(5)}
🎯 Take Profit: ${trade.take_profit.toFixed(5)}
📊 R/R: ${riskReward}

✅ Confidence: *${confidencePercent}%*

📝 ${trade.rationale}
${trade.notes ? `\n⚠️ ${trade.notes}` : ''}

_${new Date().toLocaleString()}_
    `.trim();
  }

  /**
   * Calculate Risk/Reward ratio
   */
  private calculateRiskReward(trade: TradeIdea): string {
    const risk = Math.abs(trade.entry_price - trade.stop_loss);
    const reward = Math.abs(trade.take_profit - trade.entry_price);

    if (risk === 0) return 'N/A';

    const ratio = reward / risk;
    return `1:${ratio.toFixed(2)}`;
  }
}

export const notificationService = new NotificationService();
