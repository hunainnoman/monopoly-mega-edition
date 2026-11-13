export const AUTH_COOKIE_NAME = 'mega_monopoly_auth';

export function getExpectedPassword(): string {
  return process.env.GAME_PASSWORD || '123';
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
