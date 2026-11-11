import { ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import { HomepageSections } from '@/components/admin/HomepageSections';
import { PageHeader, quietButton } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin/session';
import type { SiteSettings } from '@/lib/siteSettings';

export const metadata: Metadata = { title: 'Homepage' };

export default async function HomepageAdminPage() {
  const settings = await adminFetch<SiteSettings>('/site-settings');

  return (
    <>
      <PageHeader
        title="Homepage"
        description="Every section of the homepage, in order. Show or hide a section, change its words with Text, or open the items it lists."
        actions={<a href="/en" target="_blank" rel="noopener noreferrer" className={quietButton}><ExternalLink aria-hidden className="size-4" />View Homepage</a>}
      />
      <HomepageSections hidden={settings.homepage?.hidden ?? []} />
    </>
  );
}
