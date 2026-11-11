import type { Metadata } from 'next';
import { TextEditor } from '@/components/admin/TextEditor';
import { PageHeader } from '@/components/admin/ui';
import { getDictionary } from '@/i18n';
import { adminFetch } from '@/lib/admin/session';
import type { SiteSettings } from '@/lib/siteSettings';
import { TEXT_EDITED_ELSEWHERE } from '@/lib/admin/textGroups';
import { flattenText } from '@/lib/siteText';

const editableText = (flat: ReturnType<typeof flattenText>) => Object.fromEntries(Object.entries(flat).filter(([path]) => !TEXT_EDITED_ELSEWHERE.test(path)));

export const metadata: Metadata = { title: 'Website Text' };

export default async function WebsiteTextPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const [settings, { group }] = await Promise.all([adminFetch<SiteSettings>('/site-settings'), searchParams]);

  return (
    <>
      <PageHeader title="Website Text" description="Every heading, sentence and label on the website, in English and Bangla. Open a section, or search for the words you want to change." />
      <TextEditor defaults={{ en: editableText(flattenText(getDictionary('en'))), bn: editableText(flattenText(getDictionary('bn'))) }} saved={settings.text} initialGroup={group} />
    </>
  );
}
