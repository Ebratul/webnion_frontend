import type { Metadata } from 'next';
import { TextEditor } from '@/components/admin/TextEditor';
import { PageHeader } from '@/components/admin/ui';
import { getDictionary } from '@/i18n';
import { adminFetch } from '@/lib/admin/session';
import type { SiteSettings } from '@/lib/siteSettings';
import { flattenText } from '@/lib/siteText';

export const metadata: Metadata = { title: 'Website Text' };

export default async function WebsiteTextPage() {
  const settings = await adminFetch<SiteSettings>('/site-settings');

  return (
    <>
      <PageHeader title="Website Text" description="Every heading, sentence and label on the website, in English and Bangla. Open a section, or search for the words you want to change." />
      <TextEditor defaults={{ en: flattenText(getDictionary('en')), bn: flattenText(getDictionary('bn')) }} saved={settings.text} />
    </>
  );
}
