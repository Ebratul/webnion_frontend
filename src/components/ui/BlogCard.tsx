import { CalendarDays, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatDate } from '@/lib/format';
import type { BlogPostSummary } from '@/lib/types';
import { imageCardClass } from './imageCard';

const COVER_SIZES = '(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw';
// Fades only the last 2rem of the picture into the text, so faces and headlines in the cover stay whole
const blogCardBodyClass = 'relative -mt-8 flex flex-1 flex-col bg-[linear-gradient(to_top,#0d0f18_calc(100%-2rem),transparent)] p-5 pt-8';

// level follows the page: h2 on the blog list, h3 under a section heading
// keepScroll: on the blog list a topic link only filters the list, so the page stays where it is
export const BlogCard = ({ post, locale, t, priority = false, level = 3, keepScroll = false }: { post: BlogPostSummary; locale: Locale; t: Dictionary['blog']; priority?: boolean; level?: 2 | 3; keepScroll?: boolean }) => {
  const Heading = level === 2 ? 'h2' : 'h3';
  const href = `/${locale}/blog/${post.slug}`;
  return (
    <article className={`group ${imageCardClass}`}>
      {/* Covers come square or wide, so the whole picture is shown and a blurred copy of it fills the rest of the frame */}
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-[4/3] overflow-hidden">
        {post.cover ? (
          <>
            <Image src={post.cover} alt="" fill sizes={COVER_SIZES} className="scale-125 object-cover opacity-60 blur-2xl saturate-150" />
            <Image src={post.cover} alt="" fill priority={priority} sizes={COVER_SIZES} className="object-contain transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" />
          </>
        ) : (
          <div className="size-full bg-[radial-gradient(80%_120%_at_20%_0%,color-mix(in_srgb,var(--primary)_55%,transparent),transparent),linear-gradient(135deg,#1a1d2b,#0d0f18)]" />
        )}
      </Link>
      <div className={blogCardBodyClass}>
        {post.tags.length > 0 && (
          <p className="mb-2 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <Link key={tag} href={`/${locale}/blog?tag=${encodeURIComponent(tag)}`} scroll={!keepScroll} className="rounded-full border border-white/15 px-2.5 py-0.5 text-[0.6875rem] font-medium text-accent transition-colors duration-200 hover:border-accent">
                {tag}
              </Link>
            ))}
          </p>
        )}
        <Heading className="text-base font-medium leading-snug text-white">
          <Link href={href} className="block py-0.5 transition-colors duration-200 hover:text-accent">{post.title}</Link>
        </Heading>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-white/75">{post.excerpt}</p>}
        <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-white/70">
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden className="size-3.5" />
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-3.5" />
            {post.readingMinutes} {t.minutes}
          </span>
        </p>
      </div>
    </article>
  );
};
