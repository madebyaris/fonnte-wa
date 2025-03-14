# Fonnte WhatsApp

A modular WhatsApp integration package for the Fonnte API. This package provides a simple and flexible way to integrate WhatsApp messaging into your JavaScript/TypeScript projects using the Fonnte service.

## Features

- Send text messages, media, documents, and interactive messages (buttons, lists)
- Receive and process incoming messages via webhooks
- TypeScript support with full type definitions
- Modular architecture for flexible integration
- Comprehensive error handling

## Installation

```bash
npm install fonnte-wa
```

## Usage

### Sending Messages

```typescript
import { FonnteClient } from 'fonnte-wa';

// Initialize the client
// Note: One API key corresponds to one device in Fonnte's system
const client = new FonnteClient({
  apiKey: 'your-api-key-from-fonnte-dashboard',
  // Optional parameters
  // baseUrl: 'https://api.fonnte.com', // Default API URL
  // timeout: 30000 // Request timeout in milliseconds
});

// Send a simple text message
async function sendTextMessage() {
  const response = await client.sendMessage({
    target: '628123456789', // Target phone number with country code
    message: 'Hello from Fonnte WhatsApp package!'
  });
  
  console.log(response);
}

// Send a media message (image, video, audio)
async function sendMediaMessage() {
  const response = await client.sendMedia({
    target: '628123456789',
    message: 'Check out this image!',
    url: 'https://example.com/image.jpg'
  });
  
  console.log(response);
}

// Send a document
async function sendDocument() {
  const response = await client.sendDocument({
    target: '628123456789',
    message: 'Here is the document you requested',
    url: 'https://example.com/document.pdf',
    filename: 'document.pdf'
  });
  
  console.log(response);
}

// Send a button message
async function sendButtonMessage() {
  const response = await client.sendButtons({
    target: '628123456789',
    message: 'Please select an option:',
    buttonTemplate: {
      buttons: [
        { display: 'Option 1', id: 'opt1' },
        { display: 'Option 2', id: 'opt2' },
        { display: 'Option 3', id: 'opt3' }
      ]
    },
    footer: 'Footer text (optional)',
    header: 'Header text (optional)'
  });
  
  console.log(response);
}

// Send a list message
async function sendListMessage() {
  const response = await client.sendList({
    target: '628123456789',
    message: 'Please select from the list:',
    listTemplate: {
      title: 'Available options',
      sections: [
        {
          title: 'Section 1',
          rows: [
            { title: 'Item 1', description: 'Description 1', id: 'item1' },
            { title: 'Item 2', description: 'Description 2', id: 'item2' }
          ]
        },
        {
          title: 'Section 2',
          rows: [
            { title: 'Item 3', description: 'Description 3', id: 'item3' },
            { title: 'Item 4', description: 'Description 4', id: 'item4' }
          ]
        }
      ]
    },
    footer: 'Footer text (optional)'
  });
  
  console.log(response);
}

// Check device status
async function checkDeviceStatus() {
  const response = await client.getDeviceStatus();
  console.log(response);
}
```

### Receiving Messages (Webhook)

```typescript
import { FonnteWebhook } from 'fonnte-wa';

// Initialize the webhook handler
const webhook = new FonnteWebhook({
  port: 3000, // Port to listen on
  path: '/webhook/fonnte', // Path to listen on
  secret: 'your-secret-token' // Optional secret token for verification
});

// Register message handler
webhook.onMessage(async (message) => {
  console.log('Received message:', message);
  
  // Access message properties
  const { sender, message: text, type, button_id, list_id } = message;
  
  // Handle different message types
  if (button_id) {
    console.log(`Button ${button_id} was clicked by ${sender}`);
  } else if (list_id) {
    console.log(`List item ${list_id} was selected by ${sender}`);
  } else {
    console.log(`Received ${type} message from ${sender}: ${text}`);
  }
});

// Register multiple handlers if needed
webhook.onMessage(async (message) => {
  // Another handler for the same message
  // For example, store in database
});

// Start the webhook server
webhook.start().then(() => {
  console.log('Webhook server started');
}).catch((error) => {
  console.error('Failed to start webhook server:', error);
});

// To stop the webhook server
// webhook.stop();
```

## Advanced Usage

### Using with Express

If you already have an Express application, you can integrate the webhook handler:

```typescript
import express from 'express';
import { FonnteWebhook } from 'fonnte-wa';

const app = express();
const port = 3000;

// Your existing Express setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up other routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Initialize the webhook handler
const webhook = new FonnteWebhook({
  port: port,
  path: '/webhook/fonnte',
  secret: 'your-secret-token'
});

// Register message handler
webhook.onMessage(async (message) => {
  console.log('Received message:', message);
  // Process the message
});

// Start the webhook server
webhook.start().then(() => {
  console.log(`Server running on port ${port}`);
});
```

## Error Handling

The package includes comprehensive error handling:

```typescript
import { FonnteClient } from 'fonnte-wa';

const client = new FonnteClient({
  apiKey: 'your-api-key'
});

async function sendMessageWithErrorHandling() {
  try {
    const response = await client.sendMessage({
      target: '628123456789',
      message: 'Hello!'
    });
    
    if (!response.status) {
      console.error('Failed to send message:', response.message);
      return;
    }
    
    console.log('Message sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
```

## TypeScript Support

This package is written in TypeScript and includes full type definitions:

```typescript
import { FonnteClient, MessageOptions, FonnteResponse, WebhookMessage } from 'fonnte-wa';

// Use types in your code
const messageOptions: MessageOptions = {
  target: '628123456789',
  message: 'Hello with TypeScript!'
};

// Type-safe response handling
async function sendTypedMessage() {
  const response: FonnteResponse = await client.sendMessage(messageOptions);
  console.log(response);
}

// Type-safe webhook handling
function handleWebhookMessage(message: WebhookMessage) {
  // Access properties with type safety
  const { sender, message: text } = message;
  console.log(`Message from ${sender}: ${text}`);
}
```

## License

MIT

## Credits

This package is not officially affiliated with Fonnte. It is a community-developed wrapper for the Fonnte WhatsApp API. 