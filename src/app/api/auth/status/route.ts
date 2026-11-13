import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, AUTH_COOKIE_NAME } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = verifyAuthToken(token);

  return NextResponse.json({
    isAuthenticated,
  });
}
