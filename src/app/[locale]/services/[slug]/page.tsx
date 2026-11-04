import { ChevronLeft, ChevronRight, Phone, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { ContentBlocks } from '@/components/ui/ContentBlocks';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { getHomeData, getService } from '@/lib/api';
import { CONTACT } from '@/lib/site';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const service = await getService(slug, locale);
  if (!service) return {};

  const title = `${service.title} | Webnion`;
  const path = `/services/${slug}`;

  return {
    title,
    description: service.description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { en: `/en${path}`, bn: `/bn${path}`, 'x-default': `/en${path}` },
    },
    openGraph: { title, description: service.description, url: `/${locale}${path}`, siteName: 'Webnion', type: 'website', images: [service.image] },
  };
};

export default async function ServiceDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const [service, { services }] = await Promise.all([getService(slug, locale), getHomeData(locale)]);
  if (!service) notFound();

  const dictionary = getDictionary(locale);
  const t = dictionary.serviceDetail;

  // Images in the content sit side by side after the text, instead of one under another inside it
  const text = service.content.filter((block) => block.type !== 'image');
  const images = service.content.flatMap((block) => (block.type === 'image' ? [block.src] : []));

  const position = services.findIndex((item) => item.slug === slug);
  const previous = services[position - 1];
  const next = services[position + 1];
  const more = services.filter((item) => item.slug !== slug);
  const hrefFor = (target: string) => `/${locale}/services/${target}`;

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={[service.title]} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={service.title} />

      <div className="container-page grid items-start gap-8 py-14 lg:grid-cols-[1fr_20rem] lg:gap-10 lg:py-16">
        <div className="min-w-0">
          <Image src={service.image} alt="" width={1400} height={1050} priority sizes="(min-width: 1024px) 800px, 100vw" className="w-full rounded-2xl bg-white" />

          <div className="mt-8">
            <ContentBlocks blocks={text} locale={service.contentLocale} />
          </div>

          {images.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {images.map((src) => (
                <Image key={src} src={src} alt="" width={1000} height={600} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="aspect-[16/10] w-full rounded-2xl object-cover" />
              ))}
            </div>
          )}

          {service.faqs.length > 0 && (
            <section aria-labelledby="service-faq-title" className="mt-10" lang={service.faqsLocale}>
              <h2 id="service-faq-title" lang={locale} className="text-2xl font-medium">{dictionary.faq.title}</h2>
              <div className="mt-5 space-y-3">
                {service.faqs.map((faq, index) => (
                  <details key={faq.question} name="service-faq" open={index === 0} className="group rounded-2xl border border-line bg-surface">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-5 font-medium">
                      {faq.question}
                      <Plus aria-hidden className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-45" />
                    </summary>
                    <p className="px-5 pb-5 text-sm text-muted">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {(previous || next) && (
            <nav aria-label={t.moreServices} className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
              {previous ? (
                <Link href={hrefFor(previous.slug)} aria-label={`${t.previous}: ${previous.title}`} className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 hover:text-accent">
                  <ChevronLeft aria-hidden className="size-4" />
                  {t.previous}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={hrefFor(next.slug)} aria-label={`${t.next}: ${next.title}`} className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 hover:text-accent">
                  {t.next}
                  <ChevronRight aria-hidden className="size-4" />
                </Link>
              )}
            </nav>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          {more.length > 0 && (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-lg font-medium">{t.moreServices}</h2>
              <ul className="mt-4 space-y-2.5">
                {more.map((item) => (
                  <li key={item.id}>
                    <Link href={hrefFor(item.slug)} className="flex items-center justify-between gap-3 rounded-xl bg-bg px-4 py-3 text-sm font-medium transition-colors duration-200 hover:text-accent">
                      {item.title}
                      <ChevronRight aria-hidden className="size-4 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="band-dark relative overflow-hidden rounded-2xl">
            <Image src="/images/services/contact-card.webp" alt="" width={600} height={505} sizes="320px" className="w-full" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent p-5 pt-16">
              <p translate="no" className="text-lg font-semibold">Webnion</p>
              <p className="text-sm">{t.tagline}</p>
              <a href={`tel:${CONTACT.phoneBd}`} dir="ltr" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover">
                <Phone aria-hidden className="size-4" />
                {CONTACT.phoneBdLabel}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
