import { NextRequest, NextResponse } from 'next/server';
import { 
  getExpectedPassword, 
  generateAuthToken, 
  getRateLimitStatus, 
  recordFailedAttempt, 
  resetFailedAttempts, 
  AUTH_COOKIE_NAME 
} from '../../../../lib/auth';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'client-ip-fallback';
}

export async function POST(req: NextRequest) {
  try {
    const clientId = getClientIp(req);
    const rateLimit = getRateLimitStatus(clientId);

    if (rateLimit.isLocked) {
      return NextResponse.json(
        {
          success: false,
          isLocked: true,
          remainingSeconds: rateLimit.remainingSeconds,
          error: `Too many incorrect attempts. Locked for 30 minutes. Please wait ${Math.ceil(rateLimit.remainingSeconds / 60)} more minutes.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password field is required.' },
        { status: 400 }
      );
    }

    const expectedPassword = getExpectedPassword();

    if (password !== expectedPassword) {
      const updatedRateLimit = recordFailedAttempt(clientId);
      if (updatedRateLimit.isLocked) {
        return NextResponse.json(
          {
            success: false,
            isLocked: true,
            remainingSeconds: updatedRateLimit.remainingSeconds,
            attemptsRemaining: 0,
            error: '3 incorrect attempts reached. You are locked out for 30 minutes.',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          isLocked: false,
          attemptsRemaining: updatedRateLimit.attemptsRemaining,
          error: `Incorrect password. ${updatedRateLimit.attemptsRemaining} attempt${updatedRateLimit.attemptsRemaining === 1 ? '' : 's'} remaining before 30-minute lockout.`,
        },
        { status: 401 }
      );
    }

    // Success! Reset attempts
    resetFailedAttempts(clientId);

    const token = generateAuthToken(expectedPassword);
    const response = NextResponse.json({ success: true });

    // Set secure HTTP-only cookie valid for 7 days
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
