// Export client
export { FonnteClient } from './client/FonnteClient';

// Export webhook handler
export { FonnteWebhook } from './webhook/WebhookHandler';

// Export types
export * from './types';

// Export utilities
export * from './utils';

// Create a default export with all components
import { FonnteClient } from './client/FonnteClient';
import { FonnteWebhook } from './webhook/WebhookHandler';
import * as Types from './types';
import * as Utils from './utils';

export default {
  Client: FonnteClient,
  Webhook: FonnteWebhook,
  Types,
  Utils
}; 