import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import type { Locale } from '@/i18n/config';
import type { CaseStudy, CaseStudyDetail, HomeData, ProductSearchResult, ProjectDetail, ServiceDetail } from './types';

const EMPTY_HOME: HomeData = {
  heroBackground: null,
  services: [],
  projects: [],
  caseStudies: [],
  testimonials: [],
  deliveryStories: [],
  outcomeCards: [],
  pricingPlans: [],
  faqs: [],
  team: [],
  clients: [],
};

export const REVALIDATE_SECONDS = 60;

export const getHomeData = async (locale: Locale): Promise<HomeData> => {
  try {
    const response = await fetch(`${process.env.API_URL}/home?locale=${locale}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ['home'] },
    });
    if (!response.ok) throw new Error(`Homepage API responded with ${response.status}`);
    const body: { data: HomeData } = await response.json();
    // A cached response from before a new section was added has no entry for it
    return { ...EMPTY_HOME, ...body.data };
  } catch (error) {
    // A build must succeed without the API; the page fills in on its first revalidation.
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return EMPTY_HOME;
    // At runtime, throwing makes Next.js keep serving the last good page instead of caching an empty one.
    throw error;
  }
};

// Returns null when the slug does not exist. Any other failure throws, for the same reason as above.
const getBySlug = async <T>(resource: string, slug: string, locale: Locale): Promise<T | null> => {
  const response = await fetch(`${process.env.API_URL}/${resource}/${encodeURIComponent(slug)}?locale=${locale}`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: [resource] },
  });
  if (response.status === 400 || response.status === 404) return null;
  if (!response.ok) throw new Error(`${resource} API responded with ${response.status}`);
  const body: { data: T } = await response.json();
  return body.data;
};

export const getService = (slug: string, locale: Locale) => getBySlug<ServiceDetail>('services', slug, locale);

export const getProject = (slug: string, locale: Locale) => getBySlug<ProjectDetail>('projects', slug, locale);

export const getCaseStudy = (slug: string, locale: Locale) => getBySlug<CaseStudyDetail>('case-studies', slug, locale);

const getJson = async <T>(path: string, tag: string): Promise<T> => {
  const response = await fetch(`${process.env.API_URL}${path}`, { next: { revalidate: REVALIDATE_SECONDS, tags: [tag] } });
  if (!response.ok) throw new Error(`${tag} API responded with ${response.status}`);
  const body: { data: T } = await response.json();
  return body.data;
};

export const getCaseStudies = (locale: Locale) => getJson<CaseStudy[]>(`/case-studies?locale=${locale}`, 'case-studies');

export const getProducts = (locale: Locale, filters: Record<string, string | undefined>) => {
  const query = new URLSearchParams({ locale });
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  return getJson<ProductSearchResult>(`/products?${query}`, 'products');
};
