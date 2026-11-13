export const AUTH_COOKIE_NAME = 'mega_monopoly_auth';
export const MAX_ATTEMPTS = 3;
export const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

interface RateLimitRecord {
  attempts: number;
  lockedUntil: number | null;
}

// In-memory rate limiting store for failed attempts
const rateLimitStore = new Map<string, RateLimitRecord>();

export function getExpectedPassword(): string {
  return process.env.GAME_PASSWORD || 'monopoly123';
}

export function generateAuthToken(password: string): string {
  const str = `${password}-mega-monopoly-salt-2026`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

export function verifyAuthToken(token?: string | null): boolean {
  if (!token) return false;
  const expectedToken = generateAuthToken(getExpectedPassword());
  return token === expectedToken;
}

export function getRateLimitStatus(clientId: string): {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsRemaining: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(clientId);

  if (!record) {
    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsRemaining: MAX_ATTEMPTS,
    };
  }

  // Check if active lockout
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      isLocked: true,
      remainingSeconds,
      attemptsRemaining: 0,
    };
  }

  // Lockout expired, reset
  if (record.lockedUntil && now >= record.lockedUntil) {
    rateLimitStore.delete(clientId);
    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsRemaining: MAX_ATTEMPTS,
    };
  }

  return {
    isLocked: false,
    remainingSeconds: 0,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - record.attempts),
  };
}

export function recordFailedAttempt(clientId: string): {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsRemaining: number;
} {
  const now = Date.now();
  let record = rateLimitStore.get(clientId);

  if (!record || (record.lockedUntil && now >= record.lockedUntil)) {
    record = { attempts: 0, lockedUntil: null };
  }

  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    rateLimitStore.set(clientId, record);
    return {
      isLocked: true,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      attemptsRemaining: 0,
    };
  }

  rateLimitStore.set(clientId, record);
  return {
    isLocked: false,
    remainingSeconds: 0,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - record.attempts),
  };
}

export function resetFailedAttempts(clientId: string) {
  rateLimitStore.delete(clientId);
}
