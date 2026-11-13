import type { Metadata } from 'next';
import Form from 'next/form';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { imageCardBodyClass, imageCardClass } from '@/components/ui/imageCard';
import { isLocale } from '@/i18n/config';
import { getProducts } from '@/lib/api';
import { formatNumber, formatPrice, localPrice } from '@/lib/format';
import { SECTION_IDS, sectionHref } from '@/lib/site';
import type { Product } from '@/lib/types';
import { getContact, getOptions, getSiteDictionary } from '@/lib/siteSettings';

type Filters = { q?: string; type?: string; category?: string; pricing?: string; sort?: string };

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Filters>;
};

const fieldClass =
  'min-h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm text-fg outline-none transition-colors duration-200 placeholder:text-muted hover:border-accent/60 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30';

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = (await getSiteDictionary(locale)).productsPage;

  return {
    title: t.metaTitle,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/products`, languages: { en: '/en/products', bn: '/bn/products', 'x-default': '/en/products' } },
    openGraph: { title: t.metaTitle, description: t.subtitle, url: `/${locale}/products`, siteName: 'Webnion', type: 'website' },
  };
};

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const filters = await searchParams;
  const t = (await getSiteDictionary(locale)).productsPage;
  const [{ products, typeCounts, categoryCounts }, options] = await Promise.all([getProducts(locale, filters), getOptions()]);
  const basePath = `/${locale}/products`;

  const count = (value: number | undefined) => formatNumber(value ?? 0, locale);

  const priceLabel = (product: Product) => {
    if (product.pricing === 'FREE') return t.pricing.FREE;
    if (product.pricing === 'CONTACT' || product.price === null) return t.pricing.CONTACT;
    const price = localPrice(product.price, product.currency, locale, options.takaPrices);
    return formatPrice(price.amount, price.currency, locale);
  };

  return (
    <PageShell locale={locale}>
      <div className="bg-surface px-5 pb-20 pt-10 text-center lg:pb-24">
        <p style={{ '--delay': '100ms' } as CSSProperties} className="hero-fade inline-block rounded-full border border-line bg-bg px-3.5 py-1 text-xs font-semibold">
          {t.eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl lg:text-5xl">
          {t.titleLines.map((line, index) => (
            <span key={line} className="hero-line">
              <span style={{ '--delay': `${250 + index * 260}ms` } as CSSProperties}>{line} </span>
            </span>
          ))}
        </h1>
        <p style={{ '--delay': '1100ms' } as CSSProperties} className="hero-fade mx-auto mt-4 max-w-xl text-sm text-muted">{t.subtitle}</p>
      </div>

      <div className="container-page section-b -mt-10 lg:-mt-12">
        {/* Keyed so that "View All Products" also clears what is shown in the fields */}
        <Form
          key={JSON.stringify(filters)}
          action={basePath}
          className="relative grid gap-2 rounded-2xl border border-line bg-bg p-3 shadow-soft sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]"
        >
          <div>
            <label htmlFor="product-search" className="sr-only">{t.searchLabel}</label>
            <input id="product-search" name="q" type="search" defaultValue={filters.q} placeholder={t.searchPlaceholder} autoComplete="off" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="product-type" className="sr-only">{t.typeLabel}</label>
            <select id="product-type" name="type" defaultValue={filters.type ?? ''} className={fieldClass}>
              <option value="">{t.allTypes}</option>
              {Object.entries(t.types).map(([value, label]) => (
                <option key={value} value={value}>{label} ({count(typeCounts[value])})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product-category" className="sr-only">{t.categoryLabel}</label>
            <select id="product-category" name="category" defaultValue={filters.category ?? ''} className={fieldClass}>
              <option value="">{t.allCategories}</option>
              {Object.entries(t.categories).map(([value, label]) => (
                <option key={value} value={value}>{label} ({count(categoryCounts[value])})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product-pricing" className="sr-only">{t.pricingLabel}</label>
            <select id="product-pricing" name="pricing" defaultValue={filters.pricing ?? ''} className={fieldClass}>
              <option value="">{t.anyPrice}</option>
              {Object.entries(t.pricing).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product-sort" className="sr-only">{t.sortLabel}</label>
            <select id="product-sort" name="sort" defaultValue={filters.sort ?? 'featured'} className={fieldClass}>
              {Object.entries(t.sorts).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover sm:col-span-2 lg:col-span-1">
            {t.apply}
          </button>
        </Form>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase text-accent [&:lang(en)]:tracking-wider">{t.collection}</p>
            <h2 className="mt-1 text-2xl font-medium">{count(products.length)} {t.countLabel}</h2>
          </div>
          <p className="text-xs text-muted">{t.collectionNote}</p>
        </div>

        {products.length === 0 ? (
          <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
              <h3 className="font-medium">{t.emptyTitle}</h3>
              <p className="mt-2 text-sm text-muted">{t.emptyText}</p>
              <Link href={basePath} className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover">
                {t.viewAll}
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id} className="reveal">
                <article className={imageCardClass}>
                  <div className="relative bg-white">
                    <Image src={product.image} alt="" width={800} height={500} sizes="(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover" />
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[0.6875rem] font-semibold text-ink shadow">
                      {t.types[product.type as keyof typeof t.types] ?? product.type}
                    </span>
                  </div>
                  <div className={imageCardBodyClass}>
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="mt-2 flex-1 text-sm text-muted">{product.summary}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold tabular-nums">{priceLabel(product)}</p>
                      {product.url ? (
                        <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-accent underline-offset-4 hover:underline">{t.viewProduct}</a>
                      ) : (
                        <Link href={sectionHref(locale, SECTION_IDS.contact)} className="text-sm font-semibold text-accent underline-offset-4 hover:underline">{t.askProduct}</Link>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
