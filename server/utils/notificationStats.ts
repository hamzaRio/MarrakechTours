/**
 * Simple in-memory storage for WhatsApp notification statistics
 */

interface NotificationStats {
  totalMessagesSent: number;
  totalMessagesFailed: number;
  totalBookings: number;
  lastSentAt: Date | null;
  messagesPerAdmin: {
    [adminName: string]: {
      sent: number;
      failed: number;
    };
  };
}

// Initialize stats
const stats: NotificationStats = {
  totalMessagesSent: 0,
  totalMessagesFailed: 0,
  totalBookings: 0,
  lastSentAt: null,
  messagesPerAdmin: {
    ahmed: { sent: 0, failed: 0 },
    yahia: { sent: 0, failed: 0 },
    nadia: { sent: 0, failed: 0 }
  }
};

/**
 * Track a successful WhatsApp message
 */
export function trackMessageSuccess(adminName: string): void {
  stats.totalMessagesSent++;
  stats.lastSentAt = new Date();
  
  if (stats.messagesPerAdmin[adminName]) {
    stats.messagesPerAdmin[adminName].sent++;
  } else {
    stats.messagesPerAdmin[adminName] = { sent: 1, failed: 0 };
  }
}

/**
 * Track a failed WhatsApp message
 */
export function trackMessageFailure(adminName: string): void {
  stats.totalMessagesFailed++;
  
  if (stats.messagesPerAdmin[adminName]) {
    stats.messagesPerAdmin[adminName].failed++;
  } else {
    stats.messagesPerAdmin[adminName] = { sent: 0, failed: 1 };
  }
}

/**
 * Track a booking submission
 */
export function trackBookingSubmission(): void {
  stats.totalBookings++;
}

/**
 * Get the current notification statistics
 */
export function getNotificationStats(): NotificationStats {
  return { ...stats };
}

export default {
  trackMessageSuccess,
  trackMessageFailure,
  trackBookingSubmission,
  getNotificationStats
};