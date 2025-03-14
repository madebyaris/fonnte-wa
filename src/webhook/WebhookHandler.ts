import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { WebhookConfig, WebhookHandler, WebhookMessage } from '../types';
import { parseWebhookData } from '../utils';

/**
 * Fonnte WhatsApp Webhook Handler
 */
export class FonnteWebhook {
  private app: Express;
  private port: number;
  private path: string;
  private secret?: string;
  private handlers: WebhookHandler[] = [];
  private server: any;

  /**
   * Create a new webhook handler
   * @param config Webhook configuration
   */
  constructor(config: WebhookConfig) {
    this.app = express();
    this.port = config.port;
    this.path = config.path;
    this.secret = config.secret;

    // Configure middleware
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // Set up webhook endpoint
    this.setupWebhook();
  }

  /**
   * Set up the webhook endpoint
   */
  private setupWebhook(): void {
    // Register the webhook handler
    this.app.post(this.path, (req, res) => {
      // Verify secret token if configured
      if (this.secret && req.headers['x-webhook-secret'] !== this.secret) {
        res.status(401).json({ status: false, message: 'Unauthorized' });
        return;
      }

      try {
        // Parse webhook data
        const message = parseWebhookData(req.body);

        // Process message with all registered handlers
        this.processMessage(message);

        // Respond to Fonnte server
        res.status(200).json({ status: true, message: 'Webhook received' });
      } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ status: false, message: 'Error processing webhook' });
      }
    });

    // Add a health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: true, message: 'Webhook server is running' });
    });
  }

  /**
   * Process incoming webhook message with all registered handlers
   * @param message Parsed webhook message
   */
  private async processMessage(message: WebhookMessage): Promise<void> {
    try {
      // Execute all handlers in parallel
      await Promise.all(
        this.handlers.map(async (handler) => {
          try {
            await handler(message);
          } catch (error) {
            console.error('Error in webhook handler:', error);
          }
        })
      );
    } catch (error) {
      console.error('Error processing message with handlers:', error);
    }
  }

  /**
   * Register a new message handler
   * @param handler Function to handle incoming messages
   * @returns The webhook instance for chaining
   */
  public onMessage(handler: WebhookHandler): FonnteWebhook {
    this.handlers.push(handler);
    return this;
  }

  /**
   * Start the webhook server
   * @returns Promise that resolves when the server starts
   */
  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`Fonnte webhook server running on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Stop the webhook server
   * @returns Promise that resolves when the server stops
   */
  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((err: any) => {
        if (err) {
          reject(err);
        } else {
          console.log('Fonnte webhook server stopped');
          resolve();
        }
      });
    });
  }
} 