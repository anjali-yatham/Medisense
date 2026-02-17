const https = require('https');

function normalizeIndianMobile(num) {
  if (!num) return null;
  let s = String(num).replace(/[^0-9]/g, '');
  if (s.startsWith('0')) s = s.slice(1);
  if (s.startsWith('91') && s.length === 12) s = s.slice(2);
  if (s.length !== 10) return null;
  return s;
}

/**
 * Fast2SMS Quick SMS via GET request with query parameters.
 * Docs: https://docs.fast2sms.com/reference/quick-sms
 */
async function sendSMSFast2SMS(to, text) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) return { ok: false, error: 'FAST2SMS_API_KEY not configured' };

  const number = normalizeIndianMobile(to);
  if (!number) return { ok: false, error: 'Invalid phone number' };

  // Build query string for Quick SMS GET request
  const params = new URLSearchParams({
    authorization: apiKey,
    message: text,
    language: 'english',
    route: 'q',        // 'q' = Quick SMS route
    numbers: number
  });

  const url = `https://www.fast2sms.com/dev/bulkV2?${params.toString()}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body || '{}');
          const ok = res.statusCode >= 200 && res.statusCode < 300 && json.return === true;
          resolve({ ok, response: json, statusCode: res.statusCode });
        } catch (err) {
          resolve({ ok: false, error: err.message, raw: body.slice(0, 500), statusCode: res.statusCode });
        }
      });
    }).on('error', (err) => resolve({ ok: false, error: err.message }));
  });
}

module.exports = { sendSMSFast2SMS };
