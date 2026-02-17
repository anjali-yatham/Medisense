# Server

## Notifications & Background Worker

This server creates notification records via cron (medicine reminders, missed doses, expiry alerts, and new medicine notifications). A background worker sends pending notifications via Fast2SMS and marks them as sent.

### Environment

Create/extend `.env` in `server/` with:

- `DB_URL=<your-mongodb-connection-string>`
- `JWT_SECRET=<secret>`
- `FAST2SMS_API_KEY=<provided-by-user>`
- `NOTIFICATION_POLL_INTERVAL_MS=15000` (optional; default 15000)

### How It Works

- Cron jobs schedule notifications at:
  - 7:00 AM, 9:00 AM, 12:00 PM, 2:00 PM, 7:00 PM, 9:00 PM.
  - Missed dose check every 30 minutes (grace: 60 minutes).
  - Expiry checks daily at 8:00 AM (expired and expiring in 3 days).
  - New medicine notifications are created immediately when prescriptions are added.
- The worker (`services/notificationWorker.js`) polls pending notifications and sends SMS via Fast2SMS, then marks them as sent.

### Testing Endpoints

All are under `/api/medicines` and require Authorization bearer token unless noted.

- `POST /api/medicines/trigger-reminder` with body `{ "timing": "afterBreakfast" }`.
- `POST /api/medicines/trigger-missed-check`.
- `POST /api/medicines/trigger-expiry-check`.
- `GET /api/medicines/pending-notifications` (no auth) — lists pending.
- `PUT /api/medicines/mark-sent/:notificationId` (no auth) — marks as sent.

### Notes

- Reminders are not generated for a timing slot if the medicine was already marked taken for that slot.
- Missed dose reminders repeat every 30 minutes for the same day unless acknowledged (read) or taken.
- Phone numbers are normalized to a 10-digit Indian mobile format for Fast2SMS.
