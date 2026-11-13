import type { Metadata } from 'next';
import { NavigationForm } from '@/components/admin/NavigationForm';
import { PageHeader } from '@/components/admin/ui';
import { getDictionary } from '@/i18n';
import type { LocalizedValue } from '@/lib/admin/resources';
import { adminFetch } from '@/lib/admin/session';
import { defaultCompanyLinks, defaultNavigation } from '@/lib/navigation';
import { DEFAULT_CONTACT } from '@/lib/site';
import type { SiteSettings } from '@/lib/siteSettings';
import { applyTextOverrides } from '@/lib/siteText';

export const metadata: Metadata = { title: 'Menu & Footer' };

export default async function NavigationPage() {
  const [settings, services] = await Promise.all([adminFetch<SiteSettings>('/site-settings'), adminFetch<{ slug: string; title: LocalizedValue; isActive: boolean }[]>('/services/all')]);
  // Until the first save, the menus the site shows now, with any text already edited
  const en = applyTextOverrides(getDictionary('en'), settings.text.en);
  const bn = applyTextOverrides(getDictionary('bn'), settings.text.bn);
  const contact = { ...DEFAULT_CONTACT, ...settings.contact };
  const saved = settings.navigation;
  // Menus saved before the Company column existed start it from its default links
  const initial = saved ? { ...saved, footerCompany: saved.footerCompany ?? defaultCompanyLinks(en, bn, contact) } : defaultNavigation(en, bn, contact);

  return (
    <>
      <PageHeader title="Menu & Footer" description="The header menu, the footer's links, social links and offices. Add, remove, reorder and rename them; changes show on the site when you save." />
      <NavigationForm initial={initial} services={services.filter((service) => service.isActive).map(({ slug, title }) => ({ slug, title }))} />
    </>
  );
}
