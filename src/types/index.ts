/**
 * Fonnte API client configuration
 */
export interface FonnteConfig {
  /** API token from Fonnte dashboard */
  apiKey: string;
  /** Base URL for Fonnte API (optional) */
  baseUrl?: string;
  /** Default device ID (optional) */
  deviceId?: string;
  /** Default timeout in milliseconds (optional) */
  timeout?: number;
}

/**
 * Message options for sending messages
 */
export interface MessageOptions {
  /** Target phone number with country code (e.g., 628123456789) */
  target: string;
  /** Message content */
  message: string;
  /** URL of the media to send (optional) */
  url?: string;
  /** Device ID to use for sending (optional, overrides default) */
  deviceId?: string;
  /** Schedule time in timestamp format (optional) */
  schedule?: number;
  /** Delay between messages in seconds (optional) */
  delay?: number;
  /** Whether to enable typing animation (optional) */
  typing?: boolean;
  /** Whether to enable read receipt (optional) */
  read?: boolean;
  /** Whether to enable presence online (optional) */
  online?: boolean;
  /** Document filename if sending a document (optional) */
  filename?: string;
  /** Footer text for messages with buttons or lists (optional) */
  footer?: string;
  /** Header text for messages with buttons or lists (optional) */
  header?: string;
  /** Button template configuration (optional) */
  buttonTemplate?: ButtonTemplate;
  /** List template configuration (optional) */
  listTemplate?: ListTemplate;
}

/**
 * Button template for interactive messages
 */
export interface ButtonTemplate {
  /** Array of button objects */
  buttons: Button[];
}

/**
 * Button configuration
 */
export interface Button {
  /** Display text for the button */
  display: string;
  /** ID for the button (used in webhook responses) */
  id: string;
}

/**
 * List template for interactive messages
 */
export interface ListTemplate {
  /** Title of the list */
  title: string;
  /** Array of section objects */
  sections: Section[];
}

/**
 * Section configuration for list templates
 */
export interface Section {
  /** Title of the section */
  title: string;
  /** Array of list items */
  rows: ListItem[];
}

/**
 * List item configuration
 */
export interface ListItem {
  /** Title of the list item */
  title: string;
  /** Description of the list item (optional) */
  description?: string;
  /** ID for the list item (used in webhook responses) */
  id: string;
}

/**
 * Response from Fonnte API
 */
export interface FonnteResponse {
  /** Status of the request */
  status: boolean;
  /** Response message */
  message?: string;
  /** Response data */
  data?: any;
  /** Error details */
  error?: any;
}

/**
 * Webhook message from Fonnte
 */
export interface WebhookMessage {
  /** Device ID that received the message */
  device_id?: string;
  /** Sender's phone number */
  sender?: string;
  /** Message content */
  message?: string;
  /** Message ID */
  id?: string;
  /** Message type (text, image, etc.) */
  type?: string;
  /** Whether the message is from a group */
  is_group?: boolean;
  /** Group ID if the message is from a group */
  group_id?: string;
  /** Group name if the message is from a group */
  group_name?: string;
  /** Button ID if the message is a button response */
  button_id?: string;
  /** List ID if the message is a list response */
  list_id?: string;
  /** Media URL if the message contains media */
  url?: string;
  /** Caption if the message contains media */
  caption?: string;
  /** Filename if the message contains a document */
  filename?: string;
  /** Timestamp of the message */
  timestamp?: number;
  /** Raw webhook data */
  raw?: any;
}

/**
 * Webhook handler function type
 */
export type WebhookHandler = (message: WebhookMessage) => Promise<void> | void;

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  /** Port to listen on */
  port: number;
  /** Path to listen on */
  path: string;
  /** Secret token for webhook verification (optional) */
  secret?: string;
} 