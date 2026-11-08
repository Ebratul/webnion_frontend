import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { clientIpHeader } from '@/lib/admin/clientIp';
import { ADMIN_COOKIE } from '@/lib/admin/constants';

export const POST = async (request: Request) => {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const forwardedFor = request.headers.get('x-forwarded-for');

  // Only so the Activity Log can show it: logging out must work even if the API cannot be reached
  if (token) {
    await fetch(`${process.env.API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, ...(forwardedFor ? { 'X-Forwarded-For': forwardedFor } : {}), ...clientIpHeader(request) },
      cache: 'no-store',
    }).catch(() => undefined);
  }

  store.delete(ADMIN_COOKIE);
  return NextResponse.json({ success: true });
};
