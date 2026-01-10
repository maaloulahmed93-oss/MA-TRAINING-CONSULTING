import crypto from 'crypto';

function base64UrlEncode(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecodeToString(input) {
  const b64 = String(input).replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  const padded = pad ? b64 + '='.repeat(4 - pad) : b64;
  return Buffer.from(padded, 'base64').toString('utf8');
}

function getSecret() {
  return (
    process.env.CONSULTING_OPERATIONNEL_SESSION_SECRET ||
    process.env.JWT_SECRET ||
    process.env.ADMIN_API_KEY ||
    'dev_consulting_operationnel_secret'
  );
}

export function createConsultingOperationnelToken(accountId) {
  const payload = {
    accountId: String(accountId),
    iat: Date.now(),
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(payloadStr);

  const hmac = crypto.createHmac('sha256', getSecret());
  hmac.update(payloadB64);
  const signature = hmac.digest();
  const sigB64 = base64UrlEncode(signature);

  return `${payloadB64}.${sigB64}`;
}

export function verifyConsultingOperationnelToken(token) {
  const raw = String(token || '');
  const [payloadB64, sigB64] = raw.split('.');
  if (!payloadB64 || !sigB64) return { ok: false };

  const hmac = crypto.createHmac('sha256', getSecret());
  hmac.update(payloadB64);
  const expectedSig = hmac.digest();

  const providedSig = Buffer.from(
    String(sigB64).replace(/-/g, '+').replace(/_/g, '/'),
    'base64'
  );

  try {
    if (providedSig.length !== expectedSig.length) return { ok: false };
    if (!crypto.timingSafeEqual(providedSig, expectedSig)) return { ok: false };
  } catch {
    return { ok: false };
  }

  try {
    const payloadStr = base64UrlDecodeToString(payloadB64);
    const payload = JSON.parse(payloadStr);

    const accountId = String(payload.accountId || '');
    const iat = Number(payload.iat || 0);

    if (!/^[a-fA-F0-9]{24}$/.test(accountId)) return { ok: false };

    const maxAgeMs = 1000 * 60 * 60 * 24 * 10;
    if (!iat || Date.now() - iat > maxAgeMs) return { ok: false };

    return { ok: true, accountId };
  } catch {
    return { ok: false };
  }
}
