import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AiSettingsForm } from '@/components/admin/AiSettingsForm';
import { PageHeader } from '@/components/admin/ui';
import type { AiSettingsData } from '@/lib/admin/ai';
import { adminFetch, getAdminUser } from '@/lib/admin/session';
import { siteTextDocuments } from '@/lib/admin/siteTextDocuments';
import { getContact, getNavigation, getSiteDictionary } from '@/lib/siteSettings';

export const metadata: Metadata = { title: 'AI Settings' };

export default async function AiSettingsPage() {
  if ((await getAdminUser()).role !== 'ADMIN') notFound();

  const [data, en, bn, contact, navigationEn, navigationBn] = await Promise.all([
    adminFetch<AiSettingsData>('/ai/settings'),
    getSiteDictionary('en'),
    getSiteDictionary('bn'),
    getContact(),
    getNavigation('en'),
    getNavigation('bn'),
  ]);
  const contactLines = (offices: { name: string; address: string }[]) => [
    `Email: ${contact.email}`,
    `Phone: ${contact.phoneBdLabel}`,
    ...(contact.phoneItLabel ? [`Phone (Italy): ${contact.phoneItLabel}`] : []),
    `WhatsApp: ${contact.whatsapp}`,
    ...offices.map((office) => `Office: ${office.name}, ${office.address}`),
  ];

  return (
    <>
      <PageHeader title="AI Settings" description="The chat assistant, the blog writer and the models behind them. Keys are stored encrypted and never shown again." />
      <AiSettingsForm data={data} siteText={{ en: siteTextDocuments('en', en, contactLines(navigationEn.offices)), bn: siteTextDocuments('bn', bn, contactLines(navigationBn.offices)) }} />
    </>
  );
}
