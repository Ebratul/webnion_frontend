import { Phone } from 'lucide-react';
import Image from 'next/image';
import { Suspense } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { CONTACT, SECTION_IDS } from '@/lib/site';
import type { PricingPlan, Project, Service } from '@/lib/types';
import { WhatsAppIcon } from '../ui/BrandIcons';
import { InquiryForm } from './InquiryForm';

interface FinalInquiryProps {
  locale: Locale;
  t: Dictionary['inquiry'];
  services: Service[];
  plans: PricingPlan[];
  projects: Project[];
}

// Rotation and depth for the fan of project mockups, outermost to centre to outermost.
const FAN = [
  { rotate: '-14deg', x: '-112%', y: '15%', scale: 0.82, z: 1 },
  { rotate: '-7deg', x: '-58%', y: '5%', scale: 0.92, z: 2 },
  { rotate: '0deg', x: '0%', y: '0%', scale: 1, z: 3 },
  { rotate: '7deg', x: '58%', y: '5%', scale: 0.92, z: 2 },
  { rotate: '14deg', x: '112%', y: '15%', scale: 0.82, z: 1 },
];

const contactButton = 'flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-ink px-5 py-2 text-left text-white transition-colors duration-200 hover:border-accent';

export const FinalInquiry = ({ locale, t, services, plans, projects }: FinalInquiryProps) => {
  const options = [
    ...services.map((service) => ({ slug: service.slug, label: service.title })),
    ...plans.map((plan) => ({ slug: plan.slug, label: plan.name })),
  ];
  const fanProjects = projects.slice(0, FAN.length);

  return (
    <section id={SECTION_IDS.contact} aria-labelledby="inquiry-title" className="overflow-hidden bg-surface pt-20 lg:pt-28">
      <div className="container-page text-center">
        <h2 id="inquiry-title" className="reveal mx-auto max-w-3xl text-4xl font-semibold lg:text-5xl">
          {t.title}
        </h2>
        <p className="reveal mx-auto mt-4 max-w-2xl text-muted">{t.subtitle}</p>

        <div className="reveal mt-7 flex flex-wrap justify-center gap-3">
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className={contactButton}>
            <WhatsAppIcon className="size-6 text-whatsapp" />
            <span>
              <span className="block text-[0.6875rem] leading-tight text-white/70">{t.whatsappSmall}</span>
              <span className="block text-sm font-semibold leading-tight">{t.whatsappBig}</span>
            </span>
          </a>
          <a href={`tel:${CONTACT.phoneBd}`} className={contactButton}>
            <Phone aria-hidden className="size-6 text-accent" />
            <span>
              <span className="block text-[0.6875rem] leading-tight text-white/70">{t.callSmall}</span>
              <span dir="ltr" className="block text-sm font-semibold leading-tight">{CONTACT.phoneBdLabel}</span>
            </span>
          </a>
        </div>

        {fanProjects.length === FAN.length && (
          <div aria-hidden className="relative mx-auto mt-14 hidden h-72 max-w-5xl md:block">
            {fanProjects.map((project, index) => {
              const fan = FAN[index]!;
              return (
                <div
                  key={project.id}
                  className="absolute left-1/2 top-0 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-white shadow-soft"
                  style={{ transform: `translateX(-50%) translate(${fan.x}, ${fan.y}) rotate(${fan.rotate}) scale(${fan.scale})`, zIndex: fan.z }}
                >
                  <Image src={project.image} alt="" width={768} height={768} sizes="256px" className="aspect-square w-full object-cover" />
                </div>
              );
            })}
          </div>
        )}

        <div className="relative z-10 mx-auto mt-10 max-w-3xl rounded-t-3xl border border-b-0 border-line bg-bg p-6 text-left shadow-soft sm:p-10 md:-mt-24">
          <h3 className="text-2xl font-semibold">{t.formTitle}</h3>
          <p className="mb-7 mt-2 text-sm text-muted">{t.formSubtitle}</p>
          <Suspense>
            <InquiryForm locale={locale} t={t} options={options} />
          </Suspense>
        </div>
      </div>
    </section>
  );
};
