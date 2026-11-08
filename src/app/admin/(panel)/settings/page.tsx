import type { Metadata } from 'next';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { PageHeader } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin/session';
import { DEFAULT_CONTACT, DEFAULT_IMAGES } from '@/lib/site';
import type { SiteSettings } from '@/lib/siteSettings';

export const metadata: Metadata = { title: 'Contact & Links' };

export default async function SettingsPage() {
  const settings = await adminFetch<SiteSettings>('/site-settings');

  return (
    <>
      <PageHeader title="Contact & Links" description="Phone numbers, email, social links and section photos used across the website. Office addresses are under Website Text, in Footer and Contact Page." />
      <SettingsForm contact={{ ...DEFAULT_CONTACT, ...settings.contact }} images={{ ...DEFAULT_IMAGES, ...settings.images }} />
    </>
  );
}
