import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { BlogCard } from '@/components/ui/BlogCard';
import { Pagination } from '@/components/ui/Pagination';
import { isLocale } from '@/i18n/config';
import { getBlogPosts } from '@/lib/api';
import { getBrand, getSiteDictionary } from '@/lib/siteSettings';

export const revalidate = 60;

const PAGE_SIZE = 9;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; tag?: string }>;
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [t, brand] = await Promise.all([getSiteDictionary(locale).then((dictionary) => dictionary.blog), getBrand()]);
  const title = `${t.title} | ${brand.siteName}`;
  return {
    title,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/blog`, languages: { en: '/en/blog', bn: '/bn/blog', 'x-default': '/en/blog' } },
    openGraph: { title, description: t.subtitle, url: `/${locale}/blog`, siteName: brand.siteName, type: 'website' },
  };
};

export default async function BlogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { page: pageParam, tag } = await searchParams;
  const dictionary = await getSiteDictionary(locale);
  const t = dictionary.blog;
  const basePath = `/${locale}/blog`;

  const all = await getBlogPosts(locale);
  const tags = [...new Set(all.flatMap((post) => post.tags))].slice(0, 20);
  const matching = tag ? all.filter((post) => post.tags.some((item) => item.toLowerCase() === tag.toLowerCase())) : all;
  const pageCount = Math.max(Math.ceil(matching.length / PAGE_SIZE), 1);
  const requested = Number.parseInt(pageParam ?? '1', 10);
  const page = Number.isNaN(requested) ? 1 : Math.min(Math.max(requested, 1), pageCount);
  const posts = matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hrefFor = (target: number) => {
    const query = new URLSearchParams();
    if (tag) query.set('tag', tag);
    if (target > 1) query.set('page', String(target));
    const text = query.toString();
    return text ? `${basePath}?${text}` : basePath;
  };

  const chip = (active: boolean) =>
    `inline-flex min-h-9 items-center rounded-full border px-4 text-sm transition-colors duration-200 ${active ? 'border-primary bg-primary text-white' : 'border-line hover:border-primary hover:text-primary dark:hover:text-accent'}`;

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={[t.title]} subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />

      <div className="container-page section-y">
        {tags.length > 0 && (
          <nav aria-label={t.tags} className="mb-10 flex flex-wrap justify-center gap-2">
            <Link href={basePath} aria-current={!tag ? 'page' : undefined} className={chip(!tag)}>{t.allTags}</Link>
            {tags.map((item) => (
              <Link key={item} href={`${basePath}?tag=${encodeURIComponent(item)}`} aria-current={tag === item ? 'page' : undefined} className={chip(tag?.toLowerCase() === item.toLowerCase())}>
                {item}
              </Link>
            ))}
          </nav>
        )}

        {posts.length === 0 ? (
          <p className="py-16 text-center text-muted">{t.empty}</p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <li key={post.id} className="reveal">
                <BlogCard post={post} locale={locale} t={t} priority={index < 3} level={2} />
              </li>
            ))}
          </ul>
        )}

        <Pagination page={page} pageCount={pageCount} hrefFor={hrefFor} locale={locale} label={dictionary.caseStudiesPage.pageLabel} previous={dictionary.caseStudiesPage.previous} next={dictionary.caseStudiesPage.next} />
      </div>
    </PageShell>
  );
}
