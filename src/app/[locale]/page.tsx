import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { BlogSection } from '@/components/sections/BlogSection';
import { ClientTrust } from '@/components/sections/ClientTrust';
import { DeliveryStories } from '@/components/sections/DeliveryStories';
import { Faqs } from '@/components/sections/Faqs';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import { FinalInquiry } from '@/components/sections/FinalInquiry';
import { Hero } from '@/components/sections/Hero';
import { OutcomeCards } from '@/components/sections/OutcomeCards';
import { Outcomes } from '@/components/sections/Outcomes';
import { Pricing } from '@/components/sections/Pricing';
import { Problems } from '@/components/sections/Problems';
import { Process } from '@/components/sections/Process';
import { Services } from '@/components/sections/Services';
import { Technologies } from '@/components/sections/Technologies';
import { Testimonials } from '@/components/sections/Testimonials';
import { isLocale } from '@/i18n/config';
import { getHomeData } from '@/lib/api';
import { SITE_URL } from '@/lib/site';
import { getBrand, getContact, getHiddenSections, getNavigationSettings, getOptions, getSiteDictionary } from '@/lib/siteSettings';

export const dynamicParams = false;
export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getSiteDictionary(locale);
  const data = await getHomeData(locale);
  const [contact, brand, hidden, navigation, options] = await Promise.all([getContact(), getBrand(), getHiddenSections(), getNavigationSettings(), getOptions()]);
  const show = (key: string) => !hidden.has(key);

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.siteName,
    url: SITE_URL,
    email: contact.email,
    telephone: contact.phoneBd,
    sameAs: navigation.socials.map((social) => social.url),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, '\\u003c') }} />
      <PageShell locale={locale}>
        <Hero t={t.hero} background={data.heroBackground} />
        {show('trust') && <ClientTrust locale={locale} t={t.trust} projects={data.projects} clients={data.clients} />}
        {show('problems') && <Problems t={t.problems} />}
        {show('services') && <Services locale={locale} t={t.services} services={data.services} />}
        {show('outcomes') && <Outcomes t={t.outcomes} />}
        {show('portfolio') && <FeaturedProjects locale={locale} t={t.projects} a11y={t.a11y} projects={data.projects} />}
        {show('outcomeCards') && <OutcomeCards locale={locale} t={t.outcomeCards} cards={data.outcomeCards} />}
        {show('testimonials') && <Testimonials locale={locale} t={t.testimonials} a11y={t.a11y} testimonials={data.testimonials} />}
        {show('delivery') && <DeliveryStories t={t.delivery} stories={data.deliveryStories} />}
        {show('process') && <Process t={t.process} />}
        {show('pricing') && <Pricing locale={locale} t={t.pricing} plans={data.pricingPlans} taka={options.takaPrices} />}
        {show('technologies') && <Technologies t={t.technologies} items={data.technologies} />}
        {show('blog') && <BlogSection locale={locale} t={t.blog} posts={data.blogPosts} />}
        {show('faq') && <Faqs t={t.faq} faqs={data.faqs} founder={data.team[0]} />}
        <FinalInquiry locale={locale} t={t.inquiry} closeLabel={t.a11y.close} services={data.services} plans={data.pricingPlans} />
      </PageShell>
    </>
  );
}
