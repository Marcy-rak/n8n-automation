import { Pool } from 'pg';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../utils/logger';
import grokService from './grokService';
import embeddingService from './embeddingService';

const gmail = google.gmail('v1');

export interface EmailItem {
  id: string;
  threadId: string;
  from: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  body: string;
  date: Date;
  link: string;
  labels: string[];
}

export interface EmailSummary {
  id?: number;
  summaryDate: Date;
  totalEmails: number;
  summary: string;
  confidence: number;
  embedding?: number[];
  emailIds: string[];
  createdAt?: Date;
}

export interface GrokEmailSummaryResponse {
  overallSummary: string;
  emailSummaries: Array<{
    subject: string;
    summary: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    actionRequired: boolean;
    deadline?: string;
  }>;
  actionItems: string[];
  confidence: number;
}

/**
 * Email Summary Service
 * Fetches, summarizes, and stores email summaries using AI
 */
class EmailSummaryService {
  private pool: Pool;
  private oauth2Client: OAuth2Client | null = null;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Initialize Gmail OAuth2 client
   */
  private async initGmailAuth(): Promise<OAuth2Client> {
    if (this.oauth2Client) {
      return this.oauth2Client;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );

    // Set credentials from environment or refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    this.oauth2Client = oauth2Client;
    return oauth2Client;
  }

  /**
   * Fetch emails from Gmail with specified label
   */
  async fetchEmailsFromLabel(
    labelName: string = 'ToSummarize',
    maxResults: number = 50,
    timeRange: string = '1d'
  ): Promise<EmailItem[]> {
    try {
      const auth = await this.initGmailAuth();
      google.options({ auth });

      // Build query
      const query = `is:unread label:${labelName} newer_than:${timeRange}`;

      logger.info(`Fetching emails with query: ${query}`);

      // List messages
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      const messages = response.data.messages || [];

      if (messages.length === 0) {
        logger.info('No emails found matching criteria');
        return [];
      }

      logger.info(`Found ${messages.length} emails, fetching details...`);

      // Fetch full message details
      const emails: EmailItem[] = [];

      for (const message of messages) {
        try {
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full',
          });

          const headers = fullMessage.data.payload?.headers || [];
          const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
          const subject = headers.find((h) => h.name === 'Subject')?.value || '(No subject)';
          const dateStr = headers.find((h) => h.name === 'Date')?.value || new Date().toISOString();

          // Extract email address from "Name <email@domain.com>" format
          const emailMatch = from.match(/<(.+?)>/);
          const fromEmail = emailMatch ? emailMatch[1] : from;
          const fromName = emailMatch ? from.replace(/<.+?>/, '').trim() : from;

          // Get email body
          let body = fullMessage.data.snippet || '';
          if (fullMessage.data.payload?.body?.data) {
            body = Buffer.from(fullMessage.data.payload.body.data, 'base64').toString('utf-8');
          } else if (fullMessage.data.payload?.parts) {
            const textPart = fullMessage.data.payload.parts.find((part) => part.mimeType === 'text/plain');
            if (textPart?.body?.data) {
              body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
          }

          emails.push({
            id: message.id!,
            threadId: fullMessage.data.threadId || '',
            from: fromName,
            fromEmail,
            subject,
            snippet: fullMessage.data.snippet || '',
            body: body.substring(0, 1000), // Limit body length
            date: new Date(dateStr),
            link: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
            labels: fullMessage.data.labelIds || [],
          });
        } catch (error) {
          logger.error(`Error fetching message ${message.id}:`, error);
        }
      }

      logger.info(`Successfully fetched ${emails.length} email details`);
      return emails;
    } catch (error) {
      logger.error('Error fetching emails from Gmail:', error);
      throw error;
    }
  }

  /**
   * Generate AI summary of emails using Grok
   */
  async generateEmailSummary(emails: EmailItem[]): Promise<GrokEmailSummaryResponse> {
    try {
      logger.info(`Generating AI summary for ${emails.length} emails`);

      // Format emails for prompt
      const emailTexts = emails
        .map(
          (email, index) => `
Email ${index + 1}:
From: ${email.from} (${email.fromEmail})
Subject: ${email.subject}
Date: ${email.date.toLocaleString()}
Preview: ${email.snippet}
Link: ${email.link}
---
${email.body.substring(0, 500)}
`
        )
        .join('\n\n');

      const prompt = `You are an expert email triage assistant. Analyze these ${emails.length} emails and provide:

1. An overall summary of the key themes and important messages
2. Individual summaries for each email with:
   - Brief summary (1-2 sentences)
   - Priority level (HIGH/MEDIUM/LOW)
   - Whether action is required (true/false)
   - Deadline if mentioned
3. A list of action items across all emails
4. Your confidence in this analysis (0.0 to 1.0)

Emails:
${emailTexts}

Respond with valid JSON in this exact format:
{
  "overallSummary": "string",
  "emailSummaries": [
    {
      "subject": "string",
      "summary": "string",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "actionRequired": boolean,
      "deadline": "optional string"
    }
  ],
  "actionItems": ["string"],
  "confidence": 0.9
}`;

      const response = await grokService.analyzeMarket(prompt);

      // Parse response - Grok returns JSON in various formats
      let parsedResponse: GrokEmailSummaryResponse;

      if (typeof response === 'string') {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[1]);
        } else {
          parsedResponse = JSON.parse(response);
        }
      } else {
        parsedResponse = response as GrokEmailSummaryResponse;
      }

      // Validate response
      if (
        !parsedResponse.overallSummary ||
        !parsedResponse.emailSummaries ||
        parsedResponse.confidence === undefined
      ) {
        throw new Error('Invalid response format from Grok');
      }

      logger.info(`AI summary generated with confidence: ${parsedResponse.confidence}`);
      return parsedResponse;
    } catch (error) {
      logger.error('Error generating email summary:', error);
      throw error;
    }
  }

  /**
   * Save email summary to database
   */
  async saveEmailSummary(summary: EmailSummary): Promise<number> {
    try {
      // Generate embedding for RAG
      const embedding = await embeddingService.generateEmbedding(summary.summary);

      const result = await this.pool.query(
        `INSERT INTO email_summaries
        (summary_date, total_emails, summary, confidence, embedding, email_ids, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id`,
        [
          summary.summaryDate,
          summary.totalEmails,
          summary.summary,
          summary.confidence,
          JSON.stringify(embedding),
          JSON.stringify(summary.emailIds),
        ]
      );

      const summaryId = result.rows[0].id;
      logger.info(`Email summary saved with ID: ${summaryId}`);
      return summaryId;
    } catch (error) {
      logger.error('Error saving email summary:', error);
      throw error;
    }
  }

  /**
   * Send summary email via Gmail
   */
  async sendSummaryEmail(
    emails: EmailItem[],
    aiSummary: GrokEmailSummaryResponse,
    recipientEmail: string
  ): Promise<void> {
    try {
      const auth = await this.initGmailAuth();

      // Create HTML email
      const htmlContent = this.generateSummaryHTML(emails, aiSummary);
      const textContent = this.generateSummaryText(emails, aiSummary);

      const subject = `📧 Daily Email Summary - ${emails.length} emails (${new Date().toLocaleDateString()})`;

      // Create email message
      const message = [
        `From: ${recipientEmail}`,
        `To: ${recipientEmail}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        htmlContent,
      ].join('\n');

      const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

      // Send via Gmail API
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      logger.info(`Summary email sent successfully: ${response.data.id}`);

      // Apply "Mail Summary" label
      if (response.data.id) {
        await this.applyLabelToMessage(response.data.id, 'Mail Summary');
      }
    } catch (error) {
      logger.error('Error sending summary email:', error);
      throw error;
    }
  }

  /**
   * Apply label to Gmail message
   */
  private async applyLabelToMessage(messageId: string, labelName: string): Promise<void> {
    try {
      const auth = await this.initGmailAuth();

      // Get or create label
      const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
      let label = labelsResponse.data.labels?.find((l) => l.name === labelName);

      if (!label) {
        // Create label if it doesn't exist
        const createResponse = await gmail.users.labels.create({
          userId: 'me',
          requestBody: {
            name: labelName,
            labelListVisibility: 'labelShow',
            messageListVisibility: 'show',
          },
        });
        label = createResponse.data;
      }

      if (label?.id) {
        await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            addLabelIds: [label.id],
          },
        });
        logger.info(`Label "${labelName}" applied to message ${messageId}`);
      }
    } catch (error) {
      logger.error('Error applying label:', error);
    }
  }

  /**
   * Generate HTML email template
   */
  private generateSummaryHTML(emails: EmailItem[], aiSummary: GrokEmailSummaryResponse): string {
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid #4CAF50; padding-bottom: 15px; margin-bottom: 25px; }
    h1 { color: #2c3e50; margin: 0; font-size: 28px; }
    .date { color: #7f8c8d; font-size: 14px; margin-top: 5px; }
    .stats { background-color: #e8f5e9; padding: 12px; border-radius: 4px; text-align: center; margin-bottom: 20px; font-weight: 500; color: #2e7d32; }
    .summary-section { background-color: #f8f9fa; border-left: 4px solid #4CAF50; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
    .action-items { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
    .email-item { background-color: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin-bottom: 15px; }
    .email-item.high { border-left: 4px solid #f44336; }
    .email-item.medium { border-left: 4px solid #ff9800; }
    .email-item.low { border-left: 4px solid #4CAF50; }
    .email-subject { font-weight: 600; color: #2c3e50; font-size: 16px; margin-bottom: 5px; }
    .email-from { color: #7f8c8d; font-size: 13px; margin-bottom: 8px; }
    .email-summary { color: #555; font-size: 14px; margin: 8px 0; }
    .priority-badge { display: inline-block; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; margin-left: 10px; }
    .priority-high { background-color: #f44336; color: white; }
    .priority-medium { background-color: #ff9800; color: white; }
    .priority-low { background-color: #4CAF50; color: white; }
    .action-required { background-color: #ff5722; color: white; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; margin-left: 5px; }
    .email-link { display: inline-block; background-color: #4CAF50; color: white !important; text-decoration: none; padding: 8px 16px; border-radius: 4px; font-size: 13px; margin-top: 8px; }
    .email-link:hover { background-color: #45a049; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #7f8c8d; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Daily Email Summary</h1>
      <div class="date">${date}</div>
    </div>

    <div class="stats">
      📊 ${emails.length} email${emails.length !== 1 ? 's' : ''} summarized | Confidence: ${(aiSummary.confidence * 100).toFixed(0)}%
    </div>

    <div class="summary-section">
      <h2 style="margin-top: 0; color: #2c3e50; font-size: 18px;">🤖 AI Overview</h2>
      <p>${aiSummary.overallSummary}</p>
    </div>

    ${
      aiSummary.actionItems.length > 0
        ? `
    <div class="action-items">
      <h2 style="margin-top: 0; color: #2c3e50; font-size: 18px;">⚡ Action Items</h2>
      <ul>
        ${aiSummary.actionItems.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>
    `
        : ''
    }

    <div style="margin-top: 30px;">
      <h2 style="color: #2c3e50; font-size: 18px;">📬 Individual Emails</h2>
      ${emails
        .map((email, index) => {
          const summary = aiSummary.emailSummaries[index] || {
            summary: email.snippet,
            priority: 'MEDIUM',
            actionRequired: false,
          };
          const priorityClass = summary.priority.toLowerCase();
          return `
        <div class="email-item ${priorityClass}">
          <div class="email-subject">
            ${email.subject}
            <span class="priority-badge priority-${priorityClass}">${summary.priority}</span>
            ${summary.actionRequired ? '<span class="action-required">ACTION</span>' : ''}
          </div>
          <div class="email-from">From: ${email.from} • ${email.date.toLocaleString()}</div>
          <div class="email-summary">${summary.summary}</div>
          ${summary.deadline ? `<div style="color: #f44336; font-weight: 600;">⏰ Deadline: ${summary.deadline}</div>` : ''}
          <a href="${email.link}" class="email-link" target="_blank">Open in Gmail →</a>
        </div>
      `;
        })
        .join('')}
    </div>

    <div class="footer">
      🤖 Generated automatically by Email Summary Service<br>
      ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text email
   */
  private generateSummaryText(emails: EmailItem[], aiSummary: GrokEmailSummaryResponse): string {
    const date = new Date().toLocaleDateString();

    return `
DAILY EMAIL SUMMARY - ${date}
${'='.repeat(60)}

Total Emails: ${emails.length}
Confidence: ${(aiSummary.confidence * 100).toFixed(0)}%

AI OVERVIEW:
${aiSummary.overallSummary}

${
  aiSummary.actionItems.length > 0
    ? `
ACTION ITEMS:
${aiSummary.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}
`
    : ''
}

${'='.repeat(60)}
INDIVIDUAL EMAILS:

${emails
  .map((email, index) => {
    const summary = aiSummary.emailSummaries[index];
    return `
${index + 1}. ${email.subject} [${summary?.priority || 'MEDIUM'}]${summary?.actionRequired ? ' [ACTION]' : ''}
   From: ${email.from}
   Summary: ${summary?.summary || email.snippet}
   ${summary?.deadline ? `Deadline: ${summary.deadline}` : ''}
   Link: ${email.link}
`;
  })
  .join('\n')}

---
Generated by Email Summary Service
${new Date().toLocaleString()}
    `;
  }

  /**
   * Main orchestration method: Run complete email summary workflow
   */
  async runEmailSummaryWorkflow(
    labelName: string = 'ToSummarize',
    recipientEmail: string,
    confidenceThreshold: number = 0.6
  ): Promise<EmailSummary | null> {
    try {
      logger.info('=== Starting Email Summary Workflow ===');

      // 1. Fetch emails
      const emails = await this.fetchEmailsFromLabel(labelName, 50, '1d');

      if (emails.length === 0) {
        logger.info('No emails to summarize');
        return null;
      }

      // 2. Generate AI summary
      const aiSummary = await this.generateEmailSummary(emails);

      // 3. Check confidence threshold
      if (aiSummary.confidence < confidenceThreshold) {
        logger.warn(
          `Summary confidence ${aiSummary.confidence} below threshold ${confidenceThreshold}, skipping`
        );
        return null;
      }

      // 4. Save to database
      const summaryData: EmailSummary = {
        summaryDate: new Date(),
        totalEmails: emails.length,
        summary: JSON.stringify(aiSummary),
        confidence: aiSummary.confidence,
        emailIds: emails.map((e) => e.id),
      };

      const summaryId = await this.saveEmailSummary(summaryData);

      // 5. Send summary email
      await this.sendSummaryEmail(emails, aiSummary, recipientEmail);

      logger.info('=== Email Summary Workflow Completed Successfully ===');

      return { ...summaryData, id: summaryId };
    } catch (error) {
      logger.error('Error in email summary workflow:', error);
      throw error;
    }
  }
}

export default EmailSummaryService;
