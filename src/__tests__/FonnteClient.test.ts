import { FonnteClient } from '../client/FonnteClient';
import { MessageOptions } from '../types';
import { validatePhoneNumber, formatError } from '../utils';

// Mock axios
jest.mock('axios', () => {
  return {
    create: jest.fn().mockReturnValue({
      post: jest.fn(),
      get: jest.fn()
    })
  };
});

// Mock utils
jest.mock('../utils', () => ({
  validatePhoneNumber: jest.fn(phoneNumber => phoneNumber),
  formatError: jest.fn(error => ({
    status: false,
    message: error.message || 'Unknown error',
    error: error,
    statusCode: 0
  }))
}));

describe('FonnteClient', () => {
  let client: FonnteClient;
  let mockAxiosInstance: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new client instance for each test
    client = new FonnteClient({
      apiKey: 'test-api-key'
    });
    
    // Get the mocked axios instance
    mockAxiosInstance = require('axios').create();
  });
  
  describe('sendMessage', () => {
    it('should send a text message successfully', async () => {
      // Mock successful response
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Message sent successfully',
          data: { id: 'msg123' }
        }
      });
      
      // Test message options
      const options: MessageOptions = {
        target: '628123456789',
        message: 'Test message'
      };
      
      // Call the method
      const response = await client.sendMessage(options);
      
      // Verify axios was called with correct parameters
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/send', {
        target: '628123456789',
        message: 'Test message'
      });
      
      // Verify response
      expect(response).toEqual({
        status: true,
        message: 'Message sent successfully',
        data: { 
          status: true,
          message: 'Message sent successfully',
          data: { id: 'msg123' }
        }
      });
    });
    
    it('should handle API errors', async () => {
      // Mock validation error
      (validatePhoneNumber as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid phone number format. Must be 10-15 digits with country code.');
      });
      
      // Test message options
      const options: MessageOptions = {
        target: 'invalid',
        message: 'Test message'
      };
      
      // Call the method
      const response = await client.sendMessage(options);
      
      // Verify response contains error information
      expect(response).toEqual({
        status: false,
        message: 'Invalid phone number format. Must be 10-15 digits with country code.',
        error: expect.any(Error),
        statusCode: 0
      });
      
      // Verify axios was not called
      expect(mockAxiosInstance.post).not.toHaveBeenCalled();
    });
    
    it('should include optional parameters when provided', async () => {
      // Mock successful response
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Message sent successfully'
        }
      });
      
      // Test message options with optional parameters
      const options: MessageOptions = {
        target: '628123456789',
        message: 'Test message',
        url: 'https://example.com/image.jpg',
        typing: true,
        footer: 'Footer text'
      };
      
      // Call the method
      await client.sendMessage(options);
      
      // Verify axios was called with correct parameters
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/send', {
        target: '628123456789',
        message: 'Test message',
        url: 'https://example.com/image.jpg',
        typing: true,
        footer: 'Footer text'
      });
    });
  });
  
  describe('sendMedia', () => {
    it('should require a URL', async () => {
      // Test message options without URL
      const options: MessageOptions = {
        target: '628123456789',
        message: 'Test message'
      };
      
      // Call the method
      const response = await client.sendMedia(options);
      
      // Verify response
      expect(response).toEqual({
        status: false,
        message: 'URL is required for media messages'
      });
      
      // Verify axios was not called
      expect(mockAxiosInstance.post).not.toHaveBeenCalled();
    });
  });
  
  describe('getDeviceStatus', () => {
    it('should get device status successfully', async () => {
      // Mock successful response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Device status retrieved',
          data: { status: 'connected' }
        }
      });
      
      // Call the method
      const response = await client.getDeviceStatus();
      
      // Verify axios was called with correct parameters
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/device');
      
      // Verify response
      expect(response).toEqual({
        status: true,
        message: 'Device status retrieved',
        data: {
          status: true,
          message: 'Device status retrieved',
          data: { status: 'connected' }
        }
      });
    });
  });
}); 