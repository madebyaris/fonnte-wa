import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { FonnteConfig, MessageOptions, FonnteResponse } from '../types';
import { validatePhoneNumber, formatError } from '../utils';

/**
 * FonnteClient - Main client for interacting with the Fonnte WhatsApp API
 * 
 * Note: One API key corresponds to one device in Fonnte's system
 */
export class FonnteClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private axiosInstance: AxiosInstance;

  /**
   * Creates a new FonnteClient instance
   * 
   * @param config - Configuration options
   * @param config.apiKey - API key from Fonnte dashboard
   * @param config.baseUrl - Base URL for API requests (optional, defaults to 'https://api.fonnte.com')
   * @param config.timeout - Request timeout in milliseconds (optional, defaults to 30000)
   */
  constructor(config: FonnteConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.fonnte.com';
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
   * Sends a text message to a WhatsApp number
   * 
   * @param options - Message options
   * @param options.target - Target phone number with country code (e.g., '628123456789')
   * @param options.message - Message text content
   * @returns Promise resolving to the API response
   */
  public async sendMessage(options: MessageOptions): Promise<FonnteResponse> {
    try {
      // Validate phone number
      const target = validatePhoneNumber(options.target);
      
      // Prepare request data
      const data: Record<string, any> = {
        target,
        message: options.message
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
   * Sends a media message (image, video, audio) to a WhatsApp number
   * 
   * @param options - Media message options
   * @param options.target - Target phone number with country code
   * @param options.message - Message text content
   * @param options.url - URL of the media to send
   * @returns Promise resolving to the API response
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
   * Sends a document to a WhatsApp number
   * 
   * @param options - Document message options
   * @param options.target - Target phone number with country code
   * @param options.message - Message text content
   * @param options.url - URL of the document to send
   * @param options.filename - Filename to display for the document
   * @returns Promise resolving to the API response
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
   * Sends a button message to a WhatsApp number
   * 
   * @param options - Button message options
   * @param options.target - Target phone number with country code
   * @param options.message - Message text content
   * @param options.buttonTemplate - Button template configuration
   * @param options.footer - Optional footer text
   * @param options.header - Optional header text
   * @returns Promise resolving to the API response
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
   * Sends a list message to a WhatsApp number
   * 
   * @param options - List message options
   * @param options.target - Target phone number with country code
   * @param options.message - Message text content
   * @param options.listTemplate - List template configuration
   * @param options.footer - Optional footer text
   * @returns Promise resolving to the API response
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
   * Gets the status of the connected device
   * 
   * @returns Promise resolving to the device status response
   */
  public async getDeviceStatus(): Promise<FonnteResponse> {
    try {
      const response = await this.axiosInstance.get('/device');
      
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