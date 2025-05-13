import twilio from 'twilio';
import dotenv from 'dotenv';
import { log } from '../vite';
import { 
  trackMessageSuccess, 
  trackMessageFailure, 
  trackBookingSubmission 
} from './notificationStats';

// Load environment variables
dotenv.config();

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886';

// Admin phone numbers (WhatsApp enabled)
const adminPhones = {
  ahmed: 'whatsapp:+212600623630',
  yahia: 'whatsapp:+212693323368',
  nadia: 'whatsapp:+212654497354'
};

/**
 * Formats a booking into a WhatsApp message
 */
function formatBookingMessage(booking: {
  fullName: string;
  phoneNumber: string;
  selectedActivity: string;
  preferredDate: string;
  numberOfPeople: number;
  notes?: string;
}): string {
  return `📢 *New Booking Received*

👤 Name: ${booking.fullName}
📞 Phone: ${booking.phoneNumber}
🎯 Activity: ${booking.selectedActivity}
📅 Date: ${booking.preferredDate}
👥 People: ${booking.numberOfPeople}
📝 Notes: ${booking.notes || 'No notes provided.'}`;
}

/**
 * Send WhatsApp message to a specific admin
 */
async function sendToAdmin(
  client: twilio.Twilio,
  to: string,
  messageBody: string
): Promise<{ success: boolean; error?: any }> {
  try {
    await client.messages.create({
      body: messageBody,
      from: twilioPhone,
      to
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Send booking notification to all admins via WhatsApp
 */
export async function sendBookingNotification(booking: {
  fullName: string;
  phoneNumber: string;
  selectedActivity: string;
  preferredDate: string;
  numberOfPeople: number;
  notes?: string;
}): Promise<{ success: boolean; results: any[] }> {
  // Track this booking submission in our stats
  trackBookingSubmission();
  // Check if Twilio credentials are available
  if (!accountSid || !authToken) {
    log('Twilio credentials not found. WhatsApp notifications disabled.', 'twilio');
    log(`Would have sent WhatsApp notification to ${Object.keys(adminPhones).join(', ')}:`, 'twilio');
    log(formatBookingMessage(booking), 'twilio');
    return { success: false, results: [] };
  }

  try {
    const client = twilio(accountSid, authToken);
    const messageBody = formatBookingMessage(booking);
    
    log('Sending WhatsApp notifications to admins...', 'twilio');
    
    // Send to all admins in parallel
    const results = await Promise.allSettled([
      sendToAdmin(client, adminPhones.ahmed, messageBody),
      sendToAdmin(client, adminPhones.yahia, messageBody),
      sendToAdmin(client, adminPhones.nadia, messageBody)
    ]);
    
    // Log results with improved format for better visibility
    results.forEach((result, index) => {
      const adminName = Object.keys(adminPhones)[index];
      if (result.status === 'fulfilled' && result.value.success) {
        // Track success in stats
        trackMessageSuccess(adminName);
        
        log(`✅ WhatsApp sent to ${adminName}: SUCCESS`, 'twilio');
        console.log(`✅ WhatsApp sent to ${adminName}: SUCCESS`);
      } else {
        const errorMsg = result.status === 'rejected' 
          ? result.reason 
          : (result as PromiseFulfilledResult<{ success: boolean; error?: any }>).value.error;
        
        // Track failure in stats
        trackMessageFailure(adminName);
          
        log(`❌ WhatsApp sent to ${adminName}: FAILED - ${errorMsg}`, 'twilio');
        console.log(`❌ WhatsApp sent to ${adminName}: FAILED - ${errorMsg}`);
      }
    });
    
    // Check if at least one message was sent successfully
    const anySuccess = results.some(
      (r) => r.status === 'fulfilled' && (r.value as any).success
    );
    
    return { 
      success: anySuccess, 
      results: results.map(r => 
        r.status === 'fulfilled' ? r.value : { success: false, error: r.reason }
      ) 
    };
  } catch (error) {
    log(`Error sending WhatsApp notifications: ${error}`, 'twilio');
    return { success: false, results: [{ error }] };
  }
}

export default sendBookingNotification;