// This example shows how to use the fonnte-wa package in a JavaScript project

// Import the package
const { FonnteClient, FonnteWebhook } = require('fonnte-wa');

// Initialize the client with your API key
// Note: One API key corresponds to one device in Fonnte's system
const client = new FonnteClient({
  apiKey: 'your-api-key-from-fonnte-dashboard'
});

// Example: Send a text message
async function sendTextMessage() {
  try {
    const response = await client.sendMessage({
      target: '628123456789', // Replace with actual phone number
      message: 'Hello from Fonnte WhatsApp!'
    });
    
    console.log('Message sent:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Example: Set up a webhook to receive messages
async function setupWebhook() {
  // Initialize the webhook handler
  const webhook = new FonnteWebhook({
    port: 3000,
    path: '/webhook/fonnte'
  });

  // Register message handler
  webhook.onMessage(async (message) => {
    console.log('Received message:', message);
    
    // Auto-reply to incoming messages
    if (message.sender) {
      await client.sendMessage({
        target: message.sender,
        message: `Thank you for your message: "${message.message}". This is an automated reply.`
      });
    }
  });

  // Start the webhook server
  await webhook.start();
  console.log('Webhook server started on port 3000');
}

// Run the examples
// Uncomment the function you want to run
// sendTextMessage();
// setupWebhook();

console.log('To use this example, uncomment the function you want to run and replace the API key with your own.'); 