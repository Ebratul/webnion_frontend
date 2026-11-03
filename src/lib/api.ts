import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import type { Locale } from '@/i18n/config';
import type { HomeData } from './types';

const EMPTY_HOME: HomeData = {
  services: [],
  projects: [],
  testimonials: [],
  deliveryStories: [],
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
    return body.data;
  } catch (error) {
    // A build must succeed without the API; the page fills in on its first revalidation.
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return EMPTY_HOME;
    // At runtime, throwing makes Next.js keep serving the last good page instead of caching an empty one.
    throw error;
  }
};
