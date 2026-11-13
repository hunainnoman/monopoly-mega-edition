import { NextRequest, NextResponse } from 'next/server';
import { 
  getExpectedPassword, 
  generateAuthToken, 
  AUTH_COOKIE_NAME 
} from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json(
        {
          success: false,
          error: 'Incorrect password. Please try again.',
        },
        { status: 401 }
      );
    }

    // Success! Generate token and set HTTP-only cookie
    const token = generateAuthToken(expectedPassword);
    const response = NextResponse.json({ success: true });

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
