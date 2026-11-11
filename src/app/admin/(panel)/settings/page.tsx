import type { Metadata } from 'next';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { PageHeader } from '@/components/admin/ui';
import { getDictionary } from '@/i18n';
import { adminFetch } from '@/lib/admin/session';
import { DEFAULT_CONTACT, DEFAULT_IMAGES } from '@/lib/site';
import type { SiteSettings } from '@/lib/siteSettings';

export const metadata: Metadata = { title: 'Contact & Links' };

export default async function SettingsPage() {
  const [settings, status] = await Promise.all([adminFetch<SiteSettings>('/site-settings'), adminFetch<{ mailConfigured: boolean }>('/site-settings/status')]);
  const en = getDictionary('en').contactPage.form.budgets;
  const bn = getDictionary('bn').contactPage.form.budgets;
  const options = {
    whatsappButton: settings.options?.whatsappButton ?? true,
    inquiryEmails: settings.options?.inquiryEmails ?? ['hello@webnion.com'],
    budgets: settings.options?.budgets ?? en.map((budget, index) => ({ en: budget, bn: bn[index] ?? budget })),
  };

  return (
    <>
      <PageHeader title="Contact & Links" description="Phone numbers, email, the WhatsApp button, inquiry emails, the budget choices and section photos. Menus, social links and offices are under Menu & Footer." />
      <SettingsForm contact={{ ...DEFAULT_CONTACT, ...settings.contact }} images={{ ...DEFAULT_IMAGES, ...settings.images }} options={options} mailConfigured={status.mailConfigured} />
    </>
  );
}
