import { ArrowLeft, CalendarDays, Clock, UserRound } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/layout/PageHero';
import { PageShell } from '@/components/layout/PageShell';
import { BlogCard } from '@/components/ui/BlogCard';
import { ContentBlocks } from '@/components/ui/ContentBlocks';
import { isLocale } from '@/i18n/config';
import { getBlogPost } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { SITE_URL } from '@/lib/site';
import { getBrand, getSiteDictionary } from '@/lib/siteSettings';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string; slug: string }> };

const absolute = (src: string) => (src.startsWith('http') ? src : `${SITE_URL}${src}`);

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const [post, brand] = await Promise.all([getBlogPost(slug, locale), getBrand()]);
  if (!post) return {};

  const title = `${post.seoTitle || post.title} | ${brand.siteName}`;
  const description = post.seoDescription || post.excerpt;
  const path = `/blog/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}${path}`, languages: { en: `/en${path}`, bn: `/bn${path}`, 'x-default': `/en${path}` } },
    openGraph: {
      title,
      description,
      url: `/${locale}${path}`,
      siteName: brand.siteName,
      type: 'article',
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      modifiedTime: post.updatedAt,
      tags: post.tags,
      ...(post.cover ? { images: [{ url: post.cover, alt: post.coverAlt }] } : {}),
    },
    twitter: { card: post.cover ? 'summary_large_image' : 'summary', title, description },
  };
};

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const [post, dictionary, brand] = await Promise.all([getBlogPost(slug, locale), getSiteDictionary(locale), getBrand()]);
  if (!post) notFound();
  const t = dictionary.blog;

  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    ...(post.cover ? { image: [absolute(post.cover)] } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    author: post.authorName ? { '@type': 'Person', name: post.authorName } : { '@type': 'Organization', name: brand.siteName },
    publisher: { '@type': 'Organization', name: brand.siteName, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/${locale}/blog/${post.slug}`,
    inLanguage: post.contentLocale,
    keywords: post.tags.join(', '),
  };

  return (
    <PageShell locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, '\\u003c') }} />
      <PageHero title={post.title} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />

      <div className="container-page section-y max-w-3xl">
        {post.cover && (
          <Image src={post.cover} alt={post.coverAlt} width={1200} height={675} priority sizes="(min-width: 768px) 768px, 100vw" className="h-auto w-full rounded-2xl" />
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
          {post.authorName && (
            <span className="inline-flex items-center gap-1.5">
              <UserRound aria-hidden className="size-3.5" />
              {t.by} {post.authorName}
            </span>
          )}
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden className="size-3.5" />
              {t.published}: <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-3.5" />
            {post.readingMinutes} {t.minutes}
          </span>
        </div>

        {post.tags.length > 0 && (
          <ul aria-label={t.tags} className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link href={`/${locale}/blog?tag=${encodeURIComponent(tag)}`} className="inline-flex min-h-8 items-center rounded-full border border-line bg-tint px-3 text-xs font-medium text-accent transition-colors duration-200 hover:border-primary">
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {locale === 'bn' && post.contentLocale === 'en' && <p className="mt-6 rounded-2xl border border-line bg-tint px-4 py-3 text-sm">{t.englishOnly}</p>}

        <article className="mt-6 rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <ContentBlocks blocks={post.content} locale={post.contentLocale} />
        </article>

        <Link href={`/${locale}/blog`} className="mt-6 inline-flex items-center gap-2 py-1 text-sm text-muted transition-colors duration-200 hover:text-accent">
          <ArrowLeft aria-hidden className="size-4" />
          {t.back}
        </Link>
      </div>

      {post.related.length > 0 && (
        <section aria-labelledby="related-title" className="container-page pb-20">
          <h2 id="related-title" className="text-2xl font-medium sm:text-3xl">{t.related}</h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {post.related.map((item) => (
              <li key={item.id}>
                <BlogCard post={item} locale={locale} t={t} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
