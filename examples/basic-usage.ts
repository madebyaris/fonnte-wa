import { FonnteClient, FonnteWebhook } from '../src';

// Replace with your actual API key from Fonnte dashboard
const API_KEY = 'your-api-key-here';

// Initialize the client
const client = new FonnteClient({
  apiKey: API_KEY
});

// Example: Send a text message
async function sendTextMessage() {
  try {
    const response = await client.sendMessage({
      target: '628123456789', // Replace with actual phone number
      message: 'Hello from Fonnte WhatsApp package!'
    });
    
    console.log('Send message response:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Example: Send a media message
async function sendMediaMessage() {
  try {
    const response = await client.sendMedia({
      target: '628123456789', // Replace with actual phone number
      message: 'Check out this image!',
      url: 'https://example.com/image.jpg' // Replace with actual image URL
    });
    
    console.log('Send media response:', response);
  } catch (error) {
    console.error('Error sending media:', error);
  }
}

// Example: Send a button message
async function sendButtonMessage() {
  try {
    const response = await client.sendButtons({
      target: '628123456789', // Replace with actual phone number
      message: 'Please select an option:',
      buttonTemplate: {
        buttons: [
          { display: 'Option 1', id: 'opt1' },
          { display: 'Option 2', id: 'opt2' },
          { display: 'Option 3', id: 'opt3' }
        ]
      },
      footer: 'Choose wisely'
    });
    
    console.log('Send button message response:', response);
  } catch (error) {
    console.error('Error sending button message:', error);
  }
}

// Example: Set up a webhook to receive messages
async function setupWebhook() {
  // Initialize the webhook handler
  const webhook = new FonnteWebhook({
    port: 3000,
    path: '/webhook/fonnte',
    secret: 'your-secret-token' // Optional: For webhook verification
  });

  // Register message handler
  webhook.onMessage(async (message) => {
    console.log('Received message:', message);
    
    // Example: Auto-reply to incoming messages
    if (message.sender) {
      await client.sendMessage({
        target: message.sender,
        message: `Thank you for your message: "${message.message}". This is an automated reply.`
      });
    }
  });

  // Start the webhook server
  try {
    await webhook.start();
    console.log('Webhook server started on port 3000');
  } catch (error) {
    console.error('Failed to start webhook server:', error);
  }
}

// Run examples
async function runExamples() {
  // Uncomment the examples you want to run
  // await sendTextMessage();
  // await sendMediaMessage();
  // await sendButtonMessage();
  // await setupWebhook();
  
  console.log('Examples completed. Check the code and uncomment the examples you want to run.');
}

runExamples().catch(console.error); 