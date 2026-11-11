import type { Metadata } from 'next';
import { BrandForm } from '@/components/admin/BrandForm';
import { PageHeader } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin/session';
import { DEFAULT_BRAND } from '@/lib/site';
import type { SiteSettings } from '@/lib/siteSettings';

export const metadata: Metadata = { title: 'Brand' };

export default async function BrandPage() {
  const settings = await adminFetch<SiteSettings>('/site-settings');

  return (
    <>
      <PageHeader title="Brand" description="The website's name, logo, colour and browser tab icon. Changes show on the site as soon as you save." />
      <BrandForm initial={{ ...DEFAULT_BRAND, ...settings.brand }} />
    </>
  );
}
