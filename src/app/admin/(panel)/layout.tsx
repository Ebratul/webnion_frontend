import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { getDictionary } from '@/i18n';
import type { AiPublicConfig } from '@/lib/types';
import { adminFetch, getAdminUser } from '@/lib/admin/session';
import { getBrandOrDefault } from '@/lib/siteSettings';

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const [user, inquiries, brand, assistant] = await Promise.all([
    getAdminUser(),
    adminFetch<{ status: string }[]>('/inquiries'),
    getBrandOrDefault(),
    // The panel works the same without the assistant, so a failure only hides its button
    adminFetch<AiPublicConfig>('/ai/admin-config').catch(() => null),
  ]);
  const newInquiries = inquiries.filter((inquiry) => inquiry.status === 'NEW').length;

  return (
    <div className="min-h-svh">
      <AdminNav user={user} newInquiries={newInquiries} brand={{ siteName: brand.siteName, logoOnDark: brand.logoOnDark }} />
      <main className="relative lg:pl-[17rem]">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_srgb,var(--primary)_13%,transparent),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</div>
      </main>
      {assistant?.available && <ChatWidget locale="en" t={getDictionary('en').chat} config={assistant} endpoint="/api/admin/ai/chat/admin" storageKey="webnion-admin-chat" admin />}
    </div>
  );
}
