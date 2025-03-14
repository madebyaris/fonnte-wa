import { FonnteWebhook } from '../webhook/WebhookHandler';
import { WebhookMessage } from '../types';

// Mock express app
const mockUse = jest.fn();
const mockPost = jest.fn();
const mockGet = jest.fn();
const mockListen = jest.fn().mockImplementation((port, callback) => {
  if (callback) callback();
  return mockServer;
});
const mockServer = {
  close: jest.fn().mockImplementation(cb => {
    if (cb) cb();
    return Promise.resolve();
  })
};

// Mock express and body-parser
jest.mock('express', () => {
  return jest.fn().mockImplementation(() => ({
    use: mockUse,
    post: mockPost,
    get: mockGet,
    listen: mockListen
  }));
});

jest.mock('body-parser', () => ({
  json: jest.fn().mockReturnValue(() => {}),
  urlencoded: jest.fn().mockReturnValue(() => {})
}));

// Mock utils
jest.mock('../utils', () => ({
  parseWebhookData: jest.fn(data => data)
}));

describe('FonnteWebhook', () => {
  let webhook: FonnteWebhook;
  let postHandler: Function;
  let getHandler: Function;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a new webhook instance
    webhook = new FonnteWebhook({
      port: 3000,
      path: '/webhook',
      secret: 'test-secret'
    });
    
    // Extract handlers from mock calls
    postHandler = mockPost.mock.calls[0][1];
    getHandler = mockGet.mock.calls[0][1];
  });
  
  describe('constructor', () => {
    it('should set up the webhook endpoint', () => {
      expect(mockUse).toHaveBeenCalled();
      expect(mockPost).toHaveBeenCalledWith('/webhook', expect.any(Function));
      expect(mockGet).toHaveBeenCalledWith('/health', expect.any(Function));
    });
  });
  
  describe('onMessage', () => {
    it('should register a message handler', async () => {
      // Create a mock handler
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      
      // Register the handler
      const result = webhook.onMessage(mockHandler);
      
      // Verify the handler was registered and method is chainable
      expect(result).toBe(webhook);
      
      // Simulate a webhook request
      const req = {
        headers: { 'x-webhook-secret': 'test-secret' },
        body: {
          sender: '628123456789',
          message: 'Test message'
        }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      // Call the post handler
      await postHandler(req, res);
      
      // Verify the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: true, message: 'Webhook received' });
      
      // Verify the handler was called with parsed message
      expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({
        sender: '628123456789',
        message: 'Test message'
      }));
    });
    
    it('should verify the secret token', async () => {
      // Simulate a webhook request with invalid secret
      const req = {
        headers: { 'x-webhook-secret': 'invalid-secret' },
        body: {
          sender: '628123456789',
          message: 'Test message'
        }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      // Call the post handler
      await postHandler(req, res);
      
      // Verify the response indicates unauthorized
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ status: false, message: 'Unauthorized' });
    });
  });
  
  describe('start and stop', () => {
    it('should start and stop the server', async () => {
      // Start the server
      await webhook.start();
      
      // Verify the server was started
      expect(mockListen).toHaveBeenCalledWith(3000, expect.any(Function));
      
      // Stop the server
      await webhook.stop();
      
      // Verify the server was stopped
      expect(mockServer.close).toHaveBeenCalled();
    });
  });
  
  describe('health check', () => {
    it('should respond to health check requests', () => {
      // Simulate a health check request
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      // Call the get handler
      getHandler(req, res);
      
      // Verify the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: true, message: 'Webhook server is running' });
    });
  });
}); 