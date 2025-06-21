import twilio from 'twilio';
import dotenv from 'dotenv';
import { log } from '../logger';
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

// Admin phone numbers (WhatsApp enabled) - ordered by notification sequence
const adminPhones = {
  nadia: 'whatsapp:+212654497354', // First to be notified
  ahmed: 'whatsapp:+212600623630', // Second to be notified
  yahia: 'whatsapp:+212693323368'  // Third to be notified
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
 * Send WhatsApp message to a recipient
 */
async function sendWhatsAppMessage(
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
 * Send WhatsApp message to a specific admin
 * (Alias for sendWhatsAppMessage for backward compatibility)
 */
async function sendToAdmin(
  client: twilio.Twilio,
  to: string,
  messageBody: string
): Promise<{ success: boolean; error?: any }> {
  return sendWhatsAppMessage(client, to, messageBody);
}

/**
 * Send confirmation message to client
 */
async function sendClientConfirmation(
  client: twilio.Twilio, 
  booking: {
    fullName: string;
    phoneNumber: string;
    selectedActivity: string;
    preferredDate: string;
  }
): Promise<{ success: boolean; error?: any }> {
  // Format confirmation message for client
  const confirmationMessage = `✅ Hello ${booking.fullName}, your booking for ${booking.selectedActivity} on ${booking.preferredDate} was received!
We will contact you shortly to confirm all details.`;

  // Format the phone number to WhatsApp format
  let clientPhone = booking.phoneNumber;
  if (!clientPhone.startsWith('whatsapp:')) {
    clientPhone = `whatsapp:${clientPhone}`;
  }
  
  // Send the confirmation message
  log(`Sending confirmation WhatsApp to client (${clientPhone})...`, 'twilio');
  return sendWhatsAppMessage(client, clientPhone, confirmationMessage);
}

/**
 * Send booking notification to all admins via WhatsApp sequentially
 */
type MessageResult = {
  success: boolean;
  error?: any;
  type?: string;
};

export async function sendBookingNotification(booking: {
  fullName: string;
  phoneNumber: string;
  selectedActivity: string;
  preferredDate: string;
  numberOfPeople: number;
  notes?: string;
}): Promise<{ success: boolean; results: MessageResult[] }> {
  trackBookingSubmission();

  if (!accountSid || !authToken) {
    log('Twilio credentials not found. WhatsApp notifications disabled.', 'twilio');
    log(`Would have sent WhatsApp notification to ${Object.keys(adminPhones).join(', ')} sequentially:`, 'twilio');
    log(formatBookingMessage(booking), 'twilio');
    return { success: false, results: [] };
  }

  try {
    const client = twilio(accountSid, authToken);
    const messageBody = formatBookingMessage(booking);
    log('Sending WhatsApp notifications to admins sequentially...', 'twilio');

    const results: MessageResult[] = [];
    let anySuccess = false;

    const adminNames = ['nadia', 'ahmed', 'yahia'] as const;

    for (const adminName of adminNames) {
      try {
        const result = await sendToAdmin(client, adminPhones[adminName], messageBody);

        if (result.success) {
          trackMessageSuccess(adminName);
          log(`✅ WhatsApp sent to ${adminName}: SUCCESS`, 'twilio');
          anySuccess = true;
        } else {
          trackMessageFailure(adminName);
          log(`❌ WhatsApp sent to ${adminName}: FAILED - ${result.error}`, 'twilio');
        }

        results.push(result);

        if (adminNames.indexOf(adminName) < adminNames.length - 1) {
          log(`Waiting 1 second before sending next message...`, 'twilio');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        trackMessageFailure(adminName);
        log(`❌ WhatsApp sent to ${adminName}: FAILED - ${error}`, 'twilio');
        results.push({ success: false, error });
      }
    }

    if (anySuccess) {
      try {
        log(`Waiting 2 seconds before sending client confirmation...`, 'twilio');
        await new Promise(resolve => setTimeout(resolve, 2000));

        const clientResult = await sendClientConfirmation(client, booking);

        if (clientResult.success) {
          log(`✅ WhatsApp confirmation sent to client: SUCCESS`, 'twilio');
        } else {
          log(`❌ WhatsApp confirmation to client: FAILED - ${clientResult.error}`, 'twilio');
        }

        results.push(clientResult);
      } catch (error) {
        log(`❌ Error sending client confirmation: ${error}`, 'twilio');
        results.push({ success: false, error, type: 'client_confirmation' });
      }
    }

    return { success: anySuccess, results };
  } catch (error) {
    log(`Error sending WhatsApp notifications: ${error}`, 'twilio');
    return { success: false, results: [{ success: false, error }] };
  }
}


export default sendBookingNotification;