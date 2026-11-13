import { NextRequest, NextResponse } from 'next/server';
import { 
  getRateLimitStatus, 
  verifyAuthToken, 
  AUTH_COOKIE_NAME 
} from '../../../../lib/auth';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'client-ip-fallback';
}

export async function GET(req: NextRequest) {
  const clientId = getClientIp(req);
  const rateLimit = getRateLimitStatus(clientId);
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = verifyAuthToken(token);

  return NextResponse.json({
    isAuthenticated,
    isLocked: rateLimit.isLocked,
    remainingSeconds: rateLimit.remainingSeconds,
    attemptsRemaining: rateLimit.attemptsRemaining,
  });
}
