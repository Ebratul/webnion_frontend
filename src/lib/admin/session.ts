import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, ADMIN_LOGIN_PATH } from './constants';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR';
}

// Server side only. The token stays in an httpOnly cookie, so browser code never touches it.
export const adminFetch = async <T>(path: string): Promise<T> => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) redirect(ADMIN_LOGIN_PATH);

  const response = await fetch(`${process.env.API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (response.status === 401) redirect(ADMIN_LOGIN_PATH);
  if (!response.ok) throw new Error(`Admin API ${path} responded with ${response.status}`);

  const body: { data: T } = await response.json();
  return body.data;
};

export const getAdminUser = () => adminFetch<AdminUser>('/auth/me');
