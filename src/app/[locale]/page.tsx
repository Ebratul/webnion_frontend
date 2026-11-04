import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { DeliveryStories } from '@/components/sections/DeliveryStories';
import { Faqs } from '@/components/sections/Faqs';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import { FinalInquiry } from '@/components/sections/FinalInquiry';
import { Hero } from '@/components/sections/Hero';
import { Outcomes } from '@/components/sections/Outcomes';
import { Pricing } from '@/components/sections/Pricing';
import { ProjectMosaic } from '@/components/sections/ProjectMosaic';
import { Problems } from '@/components/sections/Problems';
import { Process } from '@/components/sections/Process';
import { Services } from '@/components/sections/Services';
import { Team } from '@/components/sections/Team';
import { Technologies } from '@/components/sections/Technologies';
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
      <PageShell locale={locale}>
        <Hero t={t.hero} trust={t.trust} clients={data.clients} />
        {data.projects.length > 0 && (
          <section aria-label={t.trust.projectsLabel}>
            <ProjectMosaic locale={locale} projects={data.projects} pauseLabel={t.a11y.pauseMotion} playLabel={t.a11y.playMotion} />
          </section>
        )}
        <Problems t={t.problems} />
        <Services locale={locale} t={t.services} services={data.services} />
        <Outcomes t={t.outcomes} />
        <FeaturedProjects locale={locale} t={t.projects} a11y={t.a11y} projects={data.projects} caseStudies={data.caseStudies} />
        <Testimonials locale={locale} t={t.testimonials} a11y={t.a11y} testimonials={data.testimonials} />
        <DeliveryStories t={t.delivery} stories={data.deliveryStories} />
        <Process t={t.process} />
        <Pricing locale={locale} t={t.pricing} plans={data.pricingPlans} />
        <Team t={t.team} members={data.team} />
        <Technologies t={t.technologies} />
        <Faqs t={t.faq} faqs={data.faqs} founder={data.team[0]} />
        <FinalInquiry locale={locale} t={t.inquiry} closeLabel={t.a11y.close} services={data.services} plans={data.pricingPlans} />
      </PageShell>
    </>
  );
}
