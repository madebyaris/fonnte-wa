/**
 * Validates a phone number format
 * @param phoneNumber Phone number to validate
 * @returns Formatted phone number or throws error
 */
export function validatePhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if the number starts with country code
  if (!cleaned.match(/^\d{10,15}$/)) {
    throw new Error('Invalid phone number format. Must be 10-15 digits with country code.');
  }
  
  return cleaned;
}

/**
 * Formats error responses from the API
 * @param error Error object from axios or other source
 * @returns Formatted error object
 */
export function formatError(error: any): any {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      status: false,
      message: error.response.data?.message || 'API error',
      error: error.response.data || error.response.statusText,
      statusCode: error.response.status
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      status: false,
      message: 'No response from server',
      error: error.request,
      statusCode: 0
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      status: false,
      message: error.message || 'Unknown error',
      error: error,
      statusCode: 0
    };
  }
}

/**
 * Parses webhook data from Fonnte
 * @param data Raw webhook data
 * @returns Parsed webhook message
 */
export function parseWebhookData(data: any): any {
  try {
    // Handle different webhook formats
    const message = {
      device_id: data.device_id || data.deviceId,
      sender: data.sender || data.from || data.phone,
      message: data.message || data.text || data.body,
      id: data.id || data.message_id,
      type: data.type || 'text',
      is_group: data.is_group || data.isGroup || false,
      group_id: data.group_id || data.groupId,
      group_name: data.group_name || data.groupName,
      button_id: data.button_id || data.buttonId || data.button,
      list_id: data.list_id || data.listId || data.list,
      url: data.url || data.media_url || data.mediaUrl,
      caption: data.caption,
      filename: data.filename || data.file_name,
      timestamp: data.timestamp || Date.now(),
      raw: data
    };
    
    return message;
  } catch (error) {
    console.error('Error parsing webhook data:', error);
    return { raw: data };
  }
} 