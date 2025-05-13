import axios from 'axios';
import { Booking } from '@shared/schema';

// HubSpot API Constants
const HUBSPOT_API_BASE_URL = 'https://api.hubapi.com';
const HUBSPOT_CONTACTS_ENDPOINT = '/crm/v3/objects/contacts';

/**
 * Interface for a generic CRM integration
 * This could be extended for different CRM providers
 */
export interface CrmIntegration {
  /**
   * Create or update a contact in the CRM with booking information
   */
  syncContactWithBooking(booking: Booking, activityName: string): Promise<CrmSyncResult>;
  
  /**
   * Check if the CRM integration is configured and available
   */
  isConfigured(): boolean;
}

/**
 * Result of a CRM sync operation
 */
export interface CrmSyncResult {
  success: boolean;
  crmId?: string;
  message?: string;
  error?: any;
}

/**
 * HubSpot CRM Integration
 */
export class HubSpotIntegration implements CrmIntegration {
  private apiKey: string | undefined;
  
  constructor() {
    this.apiKey = process.env.HUBSPOT_API_KEY;
  }
  
  /**
   * Check if HubSpot is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Sync a booking with HubSpot by creating or updating a contact
   */
  async syncContactWithBooking(booking: Booking, activityName: string): Promise<CrmSyncResult> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: 'HubSpot API key not configured'
        };
      }
      
      // Extract customer information from booking
      const { name, phone } = booking;
      
      // Create properties for the contact
      const properties = {
        firstname: name.split(' ')[0],
        lastname: name.includes(' ') ? name.split(' ').slice(1).join(' ') : '',
        phone: phone,
        booking_date: booking.date,
        booking_activity: activityName,
        booking_people: String(booking.people),
        booking_notes: booking.notes || '',
        booking_external_id: String(booking.id),
        lifecycle_stage: 'customer'
      };
      
      // Check if contact already exists by phone number
      const existingContact = await this.findContactByPhone(phone);
      
      let response;
      
      if (existingContact) {
        // Update existing contact
        response = await this.updateContact(existingContact.id, properties);
        
        // Add booking activity as a note
        await this.addNote(existingContact.id, `New booking: ${activityName} on ${booking.date} for ${booking.people} people`);
        
        return {
          success: true,
          crmId: existingContact.id,
          message: 'Contact updated in HubSpot'
        };
      } else {
        // Create new contact
        response = await this.createContact(properties);
        
        return {
          success: true,
          crmId: response.id,
          message: 'Contact created in HubSpot'
        };
      }
    } catch (error) {
      console.error('Error syncing with HubSpot:', error);
      return {
        success: false,
        message: 'Failed to sync with HubSpot',
        error
      };
    }
  }
  
  /**
   * Find a contact in HubSpot by phone number
   */
  private async findContactByPhone(phone: string): Promise<{ id: string } | null> {
    try {
      const response = await axios.post(
        `${HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts/search`,
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'phone',
                  operator: 'EQ',
                  value: phone
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.results && response.data.results.length > 0) {
        return { id: response.data.results[0].id };
      }
      
      return null;
    } catch (error) {
      console.error('Error finding contact in HubSpot:', error);
      return null;
    }
  }
  
  /**
   * Create a new contact in HubSpot
   */
  private async createContact(properties: Record<string, string>): Promise<{ id: string }> {
    const response = await axios.post(
      `${HUBSPOT_API_BASE_URL}${HUBSPOT_CONTACTS_ENDPOINT}`,
      { properties },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { id: response.data.id };
  }
  
  /**
   * Update an existing contact in HubSpot
   */
  private async updateContact(contactId: string, properties: Record<string, string>): Promise<{ id: string }> {
    const response = await axios.patch(
      `${HUBSPOT_API_BASE_URL}${HUBSPOT_CONTACTS_ENDPOINT}/${contactId}`,
      { properties },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { id: response.data.id };
  }
  
  /**
   * Add a note to a contact in HubSpot
   */
  private async addNote(contactId: string, content: string): Promise<void> {
    await axios.post(
      `${HUBSPOT_API_BASE_URL}/crm/v3/objects/notes`,
      {
        properties: {
          hs_note_body: content,
          hs_timestamp: Date.now()
        },
        associations: [
          {
            to: {
              id: contactId
            },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 202
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Zoho CRM Integration
 */
export class ZohoIntegration implements CrmIntegration {
  private accessToken: string | undefined;
  
  constructor() {
    this.accessToken = process.env.ZOHO_ACCESS_TOKEN;
  }
  
  /**
   * Check if Zoho is properly configured
   */
  isConfigured(): boolean {
    return !!this.accessToken;
  }
  
  /**
   * Sync a booking with Zoho by creating or updating a contact
   * (Implementation would go here - similar to HubSpot but with Zoho's API)
   */
  async syncContactWithBooking(booking: Booking, activityName: string): Promise<CrmSyncResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Zoho access token not configured'
      };
    }
    
    // This is a placeholder for Zoho integration
    // The actual implementation would use Zoho's API endpoints
    return {
      success: false,
      message: 'Zoho integration not implemented yet'
    };
  }
}

/**
 * Factory function to get the appropriate CRM integration based on configuration
 */
export function getCrmIntegration(): CrmIntegration | null {
  // Check if HubSpot is configured
  const hubspot = new HubSpotIntegration();
  if (hubspot.isConfigured()) {
    return hubspot;
  }
  
  // Check if Zoho is configured
  const zoho = new ZohoIntegration();
  if (zoho.isConfigured()) {
    return zoho;
  }
  
  // No CRM is properly configured
  return null;
}

/**
 * Check if any CRM integration is available and configured
 */
export function isCrmConfigured(): boolean {
  return getCrmIntegration() !== null;
}

/**
 * Sync a booking with the configured CRM
 */
export async function syncBookingWithCrm(booking: Booking, activityName: string): Promise<CrmSyncResult> {
  const crm = getCrmIntegration();
  
  if (!crm) {
    return {
      success: false,
      message: 'No CRM integration configured'
    };
  }
  
  const result = await crm.syncContactWithBooking(booking, activityName);
  
  // If successful, record the sync in our status tracker
  if (result.success) {
    const { recordSuccessfulSync } = require('./crmStatus');
    recordSuccessfulSync();
  }
  
  return result;
}