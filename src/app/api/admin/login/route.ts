import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS } from '@/lib/admin/constants';

export const POST = async (request: Request) => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const upstream = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(forwardedFor ? { 'X-Forwarded-For': forwardedFor } : {}) },
    body: await request.text(),
    cache: 'no-store',
  });
  const body = await upstream.json();
  if (!upstream.ok) return NextResponse.json(body, { status: upstream.status });

  (await cookies()).set(ADMIN_COOKIE, body.data.token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_SECONDS,
  });
  return NextResponse.json({ success: true, message: body.message, data: { user: body.data.user } });
};
