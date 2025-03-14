import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { FonnteConfig, MessageOptions, FonnteResponse } from '../types';
import { validatePhoneNumber, formatError } from '../utils';

/**
 * Fonnte WhatsApp API Client
 */
export class FonnteClient {
  private apiKey: string;
  private baseUrl: string;
  private deviceId?: string;
  private timeout: number;
  private axiosInstance: AxiosInstance;

  /**
   * Create a new Fonnte WhatsApp client
   * @param config Client configuration
   */
  constructor(config: FonnteConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.fonnte.com';
    this.deviceId = config.deviceId;
    this.timeout = config.timeout || 30000;

    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Send a text message
   * @param options Message options
   * @returns Promise with the API response
   */
  public async sendMessage(options: MessageOptions): Promise<FonnteResponse> {
    try {
      // Validate phone number
      const target = validatePhoneNumber(options.target);
      
      // Prepare request data
      const data: Record<string, any> = {
        target,
        message: options.message,
        device: options.deviceId || this.deviceId
      };

      // Add optional parameters if provided
      if (options.url) data.url = options.url;
      if (options.schedule) data.schedule = options.schedule;
      if (options.delay) data.delay = options.delay;
      if (options.typing) data.typing = options.typing;
      if (options.read) data.read = options.read;
      if (options.online) data.online = options.online;
      if (options.filename) data.filename = options.filename;
      if (options.footer) data.footer = options.footer;
      if (options.header) data.header = options.header;

      // Handle button template
      if (options.buttonTemplate) {
        data.button = JSON.stringify(options.buttonTemplate.buttons.map(btn => ({
          display: btn.display,
          id: btn.id
        })));
      }

      // Handle list template
      if (options.listTemplate) {
        data.list = JSON.stringify({
          title: options.listTemplate.title,
          sections: options.listTemplate.sections.map(section => ({
            title: section.title,
            rows: section.rows.map(row => ({
              title: row.title,
              description: row.description || '',
              id: row.id
            }))
          }))
        });
      }

      // Make API request
      const response = await this.axiosInstance.post('/send', data);
      
      return {
        status: response.data.status || true,
        message: response.data.message || 'Message sent successfully',
        data: response.data
      };
    } catch (error) {
      return formatError(error);
    }
  }

  /**
   * Send a media message (image, video, document)
   * @param options Message options with URL
   * @returns Promise with the API response
   */
  public async sendMedia(options: MessageOptions): Promise<FonnteResponse> {
    if (!options.url) {
      return {
        status: false,
        message: 'URL is required for media messages'
      };
    }
    
    return this.sendMessage(options);
  }

  /**
   * Send a document
   * @param options Message options with URL and filename
   * @returns Promise with the API response
   */
  public async sendDocument(options: MessageOptions): Promise<FonnteResponse> {
    if (!options.url) {
      return {
        status: false,
        message: 'URL is required for document messages'
      };
    }
    
    if (!options.filename) {
      return {
        status: false,
        message: 'Filename is required for document messages'
      };
    }
    
    return this.sendMessage(options);
  }

  /**
   * Send a button message
   * @param options Message options with buttonTemplate
   * @returns Promise with the API response
   */
  public async sendButtons(options: MessageOptions): Promise<FonnteResponse> {
    if (!options.buttonTemplate || !options.buttonTemplate.buttons.length) {
      return {
        status: false,
        message: 'Button template is required for button messages'
      };
    }
    
    return this.sendMessage(options);
  }

  /**
   * Send a list message
   * @param options Message options with listTemplate
   * @returns Promise with the API response
   */
  public async sendList(options: MessageOptions): Promise<FonnteResponse> {
    if (!options.listTemplate || !options.listTemplate.sections.length) {
      return {
        status: false,
        message: 'List template is required for list messages'
      };
    }
    
    return this.sendMessage(options);
  }

  /**
   * Get device status
   * @param deviceId Optional device ID (uses default if not provided)
   * @returns Promise with the API response
   */
  public async getDeviceStatus(deviceId?: string): Promise<FonnteResponse> {
    try {
      const device = deviceId || this.deviceId;
      
      if (!device) {
        return {
          status: false,
          message: 'Device ID is required'
        };
      }
      
      const response = await this.axiosInstance.get('/device', {
        params: { device }
      });
      
      return {
        status: response.data.status || true,
        message: response.data.message || 'Device status retrieved',
        data: response.data
      };
    } catch (error) {
      return formatError(error);
    }
  }
} 