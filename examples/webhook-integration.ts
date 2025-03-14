import { FonnteClient, FonnteWebhook, WebhookMessage } from '../src';

// Replace with your actual API key from Fonnte dashboard
const API_KEY = 'your-api-key-here';

// Initialize the client
const client = new FonnteClient({
  apiKey: API_KEY
});

// Create a simple chatbot using the webhook
async function startChatbot() {
  // Initialize the webhook handler
  const webhook = new FonnteWebhook({
    port: 3000,
    path: '/webhook/fonnte'
  });

  // Store conversation state (in a real app, use a database)
  const conversations: Record<string, { 
    stage: string;
    data: Record<string, any>;
    lastInteraction: number;
  }> = {};

  // Register message handler
  webhook.onMessage(async (message: WebhookMessage) => {
    if (!message.sender || !message.message) {
      console.log('Incomplete message received:', message);
      return;
    }

    const sender = message.sender;
    const text = message.message.toLowerCase();
    
    console.log(`Message from ${sender}: ${text}`);

    // Initialize conversation if it doesn't exist or is expired (30 minutes)
    if (!conversations[sender] || 
        Date.now() - conversations[sender].lastInteraction > 30 * 60 * 1000) {
      conversations[sender] = {
        stage: 'welcome',
        data: {},
        lastInteraction: Date.now()
      };
    } else {
      // Update last interaction time
      conversations[sender].lastInteraction = Date.now();
    }

    const conversation = conversations[sender];

    // Handle conversation based on stage
    switch (conversation.stage) {
      case 'welcome':
        await handleWelcomeStage(sender, text, conversation);
        break;
      case 'menu':
        await handleMenuStage(sender, text, conversation);
        break;
      case 'order':
        await handleOrderStage(sender, text, conversation);
        break;
      case 'confirm':
        await handleConfirmStage(sender, text, conversation);
        break;
      default:
        // Reset conversation if in unknown stage
        conversation.stage = 'welcome';
        await handleWelcomeStage(sender, text, conversation);
    }
  });

  // Start the webhook server
  try {
    await webhook.start();
    console.log('Chatbot webhook server started on port 3000');
  } catch (error) {
    console.error('Failed to start webhook server:', error);
  }
}

// Handle welcome stage
async function handleWelcomeStage(
  sender: string, 
  text: string, 
  conversation: { stage: string; data: Record<string, any>; lastInteraction: number }
) {
  // Send welcome message with buttons
  await client.sendButtons({
    target: sender,
    message: 'Welcome to our WhatsApp bot! How can I help you today?',
    buttonTemplate: {
      buttons: [
        { display: 'Place an Order', id: 'order' },
        { display: 'Customer Support', id: 'support' },
        { display: 'About Us', id: 'about' }
      ]
    },
    footer: 'Select an option to continue'
  });

  // Update conversation stage
  conversation.stage = 'menu';
}

// Handle menu stage
async function handleMenuStage(
  sender: string, 
  text: string, 
  conversation: { stage: string; data: Record<string, any>; lastInteraction: number }
) {
  // Check for button response
  if (text === 'order' || text.includes('place an order')) {
    // Send product list
    await client.sendList({
      target: sender,
      message: 'Please select a product:',
      listTemplate: {
        title: 'Our Products',
        sections: [
          {
            title: 'Popular Items',
            rows: [
              { title: 'Product A', description: '$10.99', id: 'product_a' },
              { title: 'Product B', description: '$12.99', id: 'product_b' }
            ]
          },
          {
            title: 'New Arrivals',
            rows: [
              { title: 'Product C', description: '$15.99', id: 'product_c' },
              { title: 'Product D', description: '$9.99', id: 'product_d' }
            ]
          }
        ]
      },
      footer: 'Tap to select a product'
    });

    // Update conversation stage
    conversation.stage = 'order';
  } else if (text === 'support' || text.includes('customer support')) {
    await client.sendMessage({
      target: sender,
      message: 'Our customer support team will contact you shortly. In the meantime, please describe your issue.'
    });

    // Reset to welcome stage after sending support message
    conversation.stage = 'welcome';
  } else if (text === 'about' || text.includes('about us')) {
    await client.sendMessage({
      target: sender,
      message: 'We are a company dedicated to providing excellent products and services. Visit our website at example.com for more information.'
    });

    // Reset to welcome stage after sending about message
    conversation.stage = 'welcome';
  } else {
    // Handle unknown response
    await client.sendMessage({
      target: sender,
      message: 'I didn\'t understand that. Please select one of the options provided.'
    });
  }
}

// Handle order stage
async function handleOrderStage(
  sender: string, 
  text: string, 
  conversation: { stage: string; data: Record<string, any>; lastInteraction: number }
) {
  // Store selected product
  if (text.includes('product_')) {
    const productId = text;
    const productNames: Record<string, string> = {
      'product_a': 'Product A',
      'product_b': 'Product B',
      'product_c': 'Product C',
      'product_d': 'Product D'
    };

    conversation.data.selectedProduct = productId;
    conversation.data.productName = productNames[productId] || 'Unknown Product';

    // Ask for confirmation
    await client.sendButtons({
      target: sender,
      message: `You selected ${conversation.data.productName}. Would you like to confirm your order?`,
      buttonTemplate: {
        buttons: [
          { display: 'Confirm Order', id: 'confirm' },
          { display: 'Cancel', id: 'cancel' }
        ]
      }
    });

    // Update conversation stage
    conversation.stage = 'confirm';
  } else {
    // Handle unknown response
    await client.sendMessage({
      target: sender,
      message: 'Please select a product from the list.'
    });
  }
}

// Handle confirmation stage
async function handleConfirmStage(
  sender: string, 
  text: string, 
  conversation: { stage: string; data: Record<string, any>; lastInteraction: number }
) {
  if (text === 'confirm' || text.includes('confirm order')) {
    // Process the order
    const orderNumber = Math.floor(10000 + Math.random() * 90000);
    conversation.data.orderNumber = orderNumber;

    await client.sendMessage({
      target: sender,
      message: `Thank you! Your order for ${conversation.data.productName} has been confirmed. Your order number is #${orderNumber}. We'll process it right away!`
    });

    // Reset conversation
    conversation.stage = 'welcome';
    conversation.data = {};
  } else if (text === 'cancel' || text.includes('cancel')) {
    await client.sendMessage({
      target: sender,
      message: 'Your order has been cancelled. Is there anything else I can help you with?'
    });

    // Reset conversation
    conversation.stage = 'welcome';
    conversation.data = {};
  } else {
    // Handle unknown response
    await client.sendButtons({
      target: sender,
      message: 'Please confirm or cancel your order.',
      buttonTemplate: {
        buttons: [
          { display: 'Confirm Order', id: 'confirm' },
          { display: 'Cancel', id: 'cancel' }
        ]
      }
    });
  }
}

// Start the chatbot
startChatbot().catch(console.error); 