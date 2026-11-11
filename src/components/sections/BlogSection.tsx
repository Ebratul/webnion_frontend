import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { BlogPostSummary } from '@/lib/types';
import { BlogCard } from '../ui/BlogCard';
import { SecondaryLink } from '../ui/Button';
import { SectionHeading } from '../ui/SectionHeading';

// The three newest posts. Nothing shows until the first post is published.
export const BlogSection = ({ locale, t, posts }: { locale: Locale; t: Dictionary['blog']; posts: BlogPostSummary[] }) => {
  if (posts.length === 0) return null;
  return (
    <section aria-labelledby="blog-title" className="section-y">
      <div className="container-page">
        <SectionHeading id="blog-title" title={t.sectionTitle} subtitle={t.sectionSubtitle} />
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id} className="reveal">
              <BlogCard post={post} locale={locale} t={t} />
            </li>
          ))}
        </ul>
        <div className="mt-10 flex justify-center">
          <SecondaryLink href={`/${locale}/blog`}>{t.viewAll}</SecondaryLink>
        </div>
      </div>
    </section>
  );
};
