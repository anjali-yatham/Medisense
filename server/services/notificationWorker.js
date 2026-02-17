// Background worker that polls pending notifications and sends SMS via Fast2SMS
const { sendSMSFast2SMS } = require('../utils/sms');
const { getPendingNotifications, markNotificationAsSent } = require('./cronService');
const Medicine = require('../models/Medicine');

let interval = null;
let inFlight = false;

/**
 * Check if a medicine_reminder or missed_dose should be skipped because dose is already taken.
 * Returns true if we should SKIP sending (i.e., already taken).
 */
async function shouldSkipBecauseTaken(notification) {
  // Only applies to medicine_reminder and missed_dose types with a timing slot
  if (notification.type !== 'medicine_reminder' && notification.type !== 'missed_dose') return false;
  if (!notification.medicineId || !notification.timing) return false;

  try {
    const medicine = await Medicine.findById(notification.medicineId);
    if (!medicine) return true; // medicine deleted, skip
    
    // If taken[timing] is true, skip sending
    if (medicine.taken && medicine.taken[notification.timing]) {
      return true;
    }
  } catch (err) {
    console.error('[NotificationWorker] Error checking taken status:', err);
  }
  return false;
}

function buildProfessionalMessage(n) {
  const suffix = ' - MediSense';
  let text;
  
  // For emergency contact notifications, use a different format
  if (n.isEmergencyContactNotification && n.emergencyContactName) {
    const greeting = `Hi ${n.emergencyContactName}, `;
    const base = n?.message || n?.title || 'Notification';
    text = `${greeting}${base}${suffix}`.trim();
  } else {
    const name = n?.userId?.name ? `Hi ${n.userId.name}, ` : '';
    const base = n?.message || n?.title || 'Notification';
    text = `${name}${base}${suffix}`.trim();
  }
  
  // SMS length considerations: keep under ~300 chars
  return text.length > 300 ? text.slice(0, 297) + '...' : text;
}

// We call internal service functions directly (no HTTP) for reliability inside the same process
async function fetchPending() {
  return await getPendingNotifications();
}

async function markSent(id) {
  return await markNotificationAsSent(id);
}

async function processOnce(logger = console) {
  if (inFlight) return;
  inFlight = true;
  try {
    const apiKeyPresent = !!process.env.FAST2SMS_API_KEY;
    if (!apiKeyPresent) {
      logger.warn('[NotificationWorker] FAST2SMS_API_KEY not set; skipping send.');
      return;
    }

    const pending = await fetchPending();
    if (!pending.length) return; // nothing to do

    for (const n of pending) {
      try {
        // Determine recipient phone number
        // For emergency contact notifications, send to emergency contact phone
        // For regular notifications, send to user's phone
        let to;
        if (n.isEmergencyContactNotification && n.emergencyContactPhone) {
          to = n.emergencyContactPhone;
        } else {
          to = n?.userId?.phone;
        }
        
        const text = buildProfessionalMessage(n);

        // Double-check: skip if medicine dose already taken (race condition safety)
        // But don't skip emergency contact notifications - they should always be sent
        if (!n.isEmergencyContactNotification && await shouldSkipBecauseTaken(n)) {
          console.log(`[NotificationWorker] Skipping ${n._id} - medicine already taken for ${n.timing}`);
          await markSent(n._id); // mark sent so it doesn't keep appearing
          continue;
        }

        if (!to) {
          logger.warn(`[NotificationWorker] Missing phone for ${n.isEmergencyContactNotification ? 'emergency contact' : 'user'} ${n?.userId?._id || 'unknown'}; skipping notification ${n?._id}`);
          continue;
        }

        const result = await sendSMSFast2SMS(to, text);
        if (!result.ok) {
          logger.error(`[NotificationWorker] SMS send failed for ${n._id}:`, result.error || result.response);
          continue; // do not mark sent
        }

        await markSent(n._id);
        const recipientType = n.isEmergencyContactNotification ? 'emergency contact' : 'user';
        logger.info(`[NotificationWorker] Sent and marked notification ${n._id} (${n.type}) to ${recipientType} at ${to}`);
      } catch (err) {
        logger.error(`[NotificationWorker] Error processing notification ${n?._id}:`, err);
      }
    }
  } catch (err) {
    console.error('[NotificationWorker] Cycle error:', err);
  } finally {
    inFlight = false;
  }
}

function startNotificationWorker(options = {}) {
  if (interval) return; // already running
  const pollMs = Number(process.env.NOTIFICATION_POLL_INTERVAL_MS || options.pollMs || 15000);
  const logger = options.logger || console;

  interval = setInterval(() => {
    processOnce(logger);
  }, pollMs);

  logger.info(`[NotificationWorker] Started. Poll interval: ${pollMs}ms`);

  // Kick once after small delay
  setTimeout(() => processOnce(logger), 3000);
}

function stopNotificationWorker() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

module.exports = {
  startNotificationWorker,
  stopNotificationWorker,
  processOnce, // exported for tests
};
