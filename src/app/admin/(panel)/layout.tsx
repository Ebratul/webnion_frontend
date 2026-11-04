import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const [user, inquiries] = await Promise.all([getAdminUser(), adminFetch<{ status: string }[]>('/inquiries')]);
  const newInquiries = inquiries.filter((inquiry) => inquiry.status === 'NEW').length;

  return (
    <div className="min-h-svh">
      <AdminNav user={user} newInquiries={newInquiries} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
