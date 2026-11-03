import { notFound } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { ClientTrust } from '@/components/sections/ClientTrust';
import { DeliveryStories } from '@/components/sections/DeliveryStories';
import { Faqs } from '@/components/sections/Faqs';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import { FinalInquiry } from '@/components/sections/FinalInquiry';
import { Hero } from '@/components/sections/Hero';
import { Outcomes } from '@/components/sections/Outcomes';
import { Pricing } from '@/components/sections/Pricing';
import { Problems } from '@/components/sections/Problems';
import { Process } from '@/components/sections/Process';
import { Services } from '@/components/sections/Services';
import { Team } from '@/components/sections/Team';
import { Testimonials } from '@/components/sections/Testimonials';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { getHomeData } from '@/lib/api';
import { CONTACT, SITE_URL } from '@/lib/site';

export const dynamicParams = false;
export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const data = await getHomeData(locale);

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Webnion',
    url: SITE_URL,
    email: CONTACT.email,
    telephone: CONTACT.phoneBd,
    sameAs: [CONTACT.facebook, CONTACT.instagram],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t.a11y.skipToContent}
      </a>
      <Header locale={locale} nav={t.nav} a11y={t.a11y} />
      <main id="main">
        <Hero t={t.hero} />
        <ClientTrust t={t.trust} a11y={t.a11y} projects={data.projects} clients={data.clients} />
        <Problems t={t.problems} />
        <Services t={t.services} services={data.services} />
        <Outcomes t={t.outcomes} />
        <FeaturedProjects t={t.projects} a11y={t.a11y} projects={data.projects} />
        <Testimonials locale={locale} t={t.testimonials} a11y={t.a11y} testimonials={data.testimonials} />
        <DeliveryStories t={t.delivery} stories={data.deliveryStories} />
        <Process t={t.process} />
        <Pricing locale={locale} t={t.pricing} plans={data.pricingPlans} />
        <Team t={t.team} members={data.team} />
        <Faqs t={t.faq} faqs={data.faqs} founder={data.team[0]} />
        <FinalInquiry locale={locale} t={t.inquiry} services={data.services} plans={data.pricingPlans} projects={data.projects} />
      </main>
      <Footer locale={locale} t={t.footer} nav={t.nav} label={t.a11y.footerNav} />
      <WhatsAppButton label={t.a11y.whatsapp} />
    </>
  );
}
