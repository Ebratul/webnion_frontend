import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { ImageReviews } from '@/components/reviews/ImageReviews';
import { VideoReviews } from '@/components/reviews/VideoReviews';
import { FinalInquiry } from '@/components/sections/FinalInquiry';
import { RatingSummary } from '@/components/sections/RatingSummary';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { isLocale } from '@/i18n/config';
import { getHomeData } from '@/lib/api';
import { getBrand, getSiteDictionary } from '@/lib/siteSettings';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [dictionary, brand] = await Promise.all([getSiteDictionary(locale), getBrand()]);
  const t = dictionary.reviewsPage;
  const title = `${t.metaTitle} | ${brand.siteName}`;
  return {
    title,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/reviews`, languages: { en: '/en/reviews', bn: '/bn/reviews', 'x-default': '/en/reviews' } },
    openGraph: { title, description: t.subtitle, url: `/${locale}/reviews`, siteName: brand.siteName, type: 'website' },
  };
};

// Every customer review from Content → Customer Reviews: the videos first, then the screenshots of client messages,
// in the admin's order, each with the client's name and company underneath
export default async function ReviewsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, data] = await Promise.all([getSiteDictionary(locale), getHomeData(locale)]);
  const t = dictionary.reviewsPage;
  const videos = data.testimonials.filter((item) => item.kind === 'VIDEO' && item.videoUrl);
  const messages = data.testimonials.filter((item) => item.kind === 'RESULT');

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={t.titleLines} subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />

      {data.testimonials.length === 0 ? (
        <p className="container-page section-y text-center text-muted">{t.empty}</p>
      ) : (
        <>
          <div className="container-page pt-12">
            <RatingSummary locale={locale} t={dictionary.testimonials} a11y={dictionary.a11y} testimonials={data.testimonials} />
          </div>

          {videos.length > 0 && (
            <section aria-labelledby="video-reviews-title" className="section-y">
              <div className="container-page">
                <SectionHeading id="video-reviews-title" eyebrow={t.videoEyebrow} title={t.videoTitle} subtitle={t.videoSubtitle} />
                <div className="mt-12">
                  <VideoReviews items={videos} t={t} unsupported={dictionary.testimonials.videoUnsupported} locale={locale} />
                </div>
              </div>
            </section>
          )}

          {messages.length > 0 && (
            // Lavender like the homepage reviews, so the messages read as their own band after the videos
            <section aria-labelledby="message-reviews-title" className="section-y bg-[#f7f7fe] dark:bg-surface">
              <div className="container-page">
                <SectionHeading id="message-reviews-title" eyebrow={t.imageEyebrow} title={t.imageTitle} subtitle={t.imageSubtitle} />
                <div className="mt-12">
                  <ImageReviews items={messages} t={t} a11y={dictionary.a11y} locale={locale} />
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <FinalInquiry locale={locale} t={dictionary.inquiry} closeLabel={dictionary.a11y.close} services={data.services} plans={data.pricingPlans} />
    </PageShell>
  );
}
