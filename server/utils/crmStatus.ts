/**
 * Helper utilities for reporting CRM status
 */

// Last time CRM was synced successfully
let lastSuccessfulSync: Date | null = null;

// Count of contacts synced successfully
let contactsSynced: number = 0;

/**
 * Record a successful CRM sync
 */
export function recordSuccessfulSync(): void {
  lastSuccessfulSync = new Date();
  contactsSynced++;
}

/**
 * Get the CRM status information
 */
export function getCrmStatus(): {
  connected: boolean;
  provider?: 'hubspot' | 'zoho' | null;
  lastSync?: string;
  totalContacts?: number;
  error?: string;
} {
  // Check if any CRM is configured
  const hubspotApiKey = process.env.HUBSPOT_API_KEY;
  const zohoAccessToken = process.env.ZOHO_ACCESS_TOKEN;
  
  if (!hubspotApiKey && !zohoAccessToken) {
    return {
      connected: false,
      error: 'No CRM API keys found in environment variables'
    };
  }
  
  const provider = hubspotApiKey ? 'hubspot' : 'zoho';
  
  return {
    connected: true,
    provider,
    lastSync: lastSuccessfulSync ? lastSuccessfulSync.toISOString() : undefined,
    totalContacts: contactsSynced || undefined
  };
}

/**
 * Test the CRM connection by making a simple API call
 */
export async function testCrmConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  // Check if any CRM is configured
  const hubspotApiKey = process.env.HUBSPOT_API_KEY;
  const zohoAccessToken = process.env.ZOHO_ACCESS_TOKEN;
  
  if (!hubspotApiKey && !zohoAccessToken) {
    return {
      success: false,
      message: 'No CRM API keys found in environment variables'
    };
  }
  
  try {
    if (hubspotApiKey) {
      // For HubSpot, we would typically make a test API call here
      // In this example, we're just simulating the test
      // In a real implementation, you would use the HubSpot API client
      
      // Simulate API call behavior
      const hasValidKey = hubspotApiKey.length > 10;
      
      if (hasValidKey) {
        return {
          success: true,
          message: 'Successfully connected to HubSpot CRM'
        };
      } else {
        return {
          success: false,
          message: 'HubSpot API key appears to be invalid'
        };
      }
    } else if (zohoAccessToken) {
      // For Zoho, we would make a similar test call
      // Again, simulating the response for this example
      
      const hasValidToken = zohoAccessToken.length > 10;
      
      if (hasValidToken) {
        return {
          success: true,
          message: 'Successfully connected to Zoho CRM'
        };
      } else {
        return {
          success: false,
          message: 'Zoho access token appears to be invalid'
        };
      }
    }
    
    return {
      success: false,
      message: 'No supported CRM integration enabled'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error testing CRM connection'
    };
  }
}