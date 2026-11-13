import type { Metadata } from 'next';
import { PricingPageForm } from '@/components/admin/PricingPageForm';
import { PageHeader } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin/session';
import { DEFAULT_PRICING_PAGE } from '@/lib/pricingPage';
import type { SiteSettings } from '@/lib/siteSettings';

export const metadata: Metadata = { title: 'Pricing Page' };

export default async function PricingPageAdmin() {
  const settings = await adminFetch<SiteSettings>('/site-settings');
  return (
    <>
      <PageHeader
        title="Pricing Page"
        description="The lists on the Pricing page, under the plans. The plans and prices are under Pricing; headings and other text are under Website Text → Pricing Page."
        actions={
          <a href="/en/pricing" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm font-medium transition-colors duration-200 hover:border-accent/60 hover:text-white">
            View Page
          </a>
        }
      />
      <PricingPageForm initial={settings.pricingPage ?? DEFAULT_PRICING_PAGE} />
    </>
  );
}
