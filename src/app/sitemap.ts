import type { MetadataRoute } from 'next';
import { LOCALES } from '@/i18n/config';
import { getBlogPosts, getHomeData } from '@/lib/api';
import { SITE_URL } from '@/lib/site';

const entriesFor = (path: string, priority: number): MetadataRoute.Sitemap =>
  LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    changeFrequency: 'weekly',
    priority,
    alternates: { languages: { en: `${SITE_URL}/en${path}`, bn: `${SITE_URL}/bn${path}` } },
  }));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { services, projects, caseStudies } = await getHomeData('en');
  // A sitemap without the blog is better than none when the API is down
  const posts = await getBlogPosts('en').catch(() => []);

  return [
    ...entriesFor('', 1),
    ...entriesFor('/service', 0.8),
    ...entriesFor('/project', 0.8),
    ...entriesFor('/products', 0.8),
    ...entriesFor('/contact', 0.8),
    ...entriesFor('/case-studies', 0.8),
    ...entriesFor('/team', 0.8),
    ...entriesFor('/blog', 0.8),
    ...services.flatMap((service) => entriesFor(`/services/${service.slug}`, 0.7)),
    ...projects.flatMap((project) => entriesFor(`/project/${project.slug}`, 0.7)),
    ...caseStudies.flatMap((study) => entriesFor(`/case-studies/${study.slug}`, 0.7)),
    ...posts.flatMap((post) => entriesFor(`/blog/${post.slug}`, 0.7).map((entry) => ({ ...entry, ...(post.publishedAt ? { lastModified: post.publishedAt } : {}) }))),
  ];
}
