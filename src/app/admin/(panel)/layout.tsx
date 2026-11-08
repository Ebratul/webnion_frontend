import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const [user, inquiries] = await Promise.all([getAdminUser(), adminFetch<{ status: string }[]>('/inquiries')]);
  const newInquiries = inquiries.filter((inquiry) => inquiry.status === 'NEW').length;

  return (
    <div className="min-h-svh">
      <AdminNav user={user} newInquiries={newInquiries} />
      <main className="relative lg:pl-[17rem]">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(130_36_227/0.13),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
