import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin/constants';

export const POST = async () => {
  (await cookies()).delete(ADMIN_COOKIE);
  return NextResponse.json({ success: true });
};
