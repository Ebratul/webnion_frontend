import type { Locale } from '@/i18n/config';

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
}

export interface ServiceDetail extends Service {
  content: ContentBlock[];
  contentLocale: Locale;
  faqs: { question: string; answer: string }[];
  faqsLocale: Locale;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  isFeatured: boolean;
}

export type ContentBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string };

export interface ProjectDetail extends Project {
  client: string | null;
  budget: string | null;
  location: string | null;
  sector: string | null;
  completedAt: string | null;
  content: ContentBlock[];
  contentLocale: Locale;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  category: string;
  image: string;
  publishedAt: string | null;
  excerpt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  summary: string;
  image: string;
  type: string;
  category: string;
  pricing: string;
  price: number | null;
  currency: string;
  url: string | null;
  isFeatured: boolean;
}

export interface ProductSearchResult {
  products: Product[];
  typeCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
}

export interface CaseStudyDetail extends CaseStudy {
  content: ContentBlock[];
  contentLocale: Locale;
}

export interface Testimonial {
  id: string;
  kind: 'VIDEO' | 'RESULT';
  name: string;
  role: string;
  avatar: string | null;
  image: string;
  videoUrl: string | null;
}

export interface DeliveryStory {
  id: string;
  title: string;
  caption: string;
  image: string;
}

export interface OutcomeCard {
  id: string;
  eyebrow: string | null;
  title: string;
  description: string;
  points: string[];
  image: string;
  buttonLabel: string | null;
  buttonUrl: string | null;
}

export interface PricingPlan {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  badge: string | null;
  price: number;
  currency: string;
  features: string[];
  priceLabel: string | null;
  buttonLabel: string | null;
  note: string | null;
  isFeatured: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
}

export interface ClientLogo {
  id: string;
  name: string;
  logo: string;
  url: string | null;
}

export interface HomeData {
  heroBackground: string | null;
  services: Service[];
  projects: Project[];
  caseStudies: CaseStudy[];
  testimonials: Testimonial[];
  deliveryStories: DeliveryStory[];
  outcomeCards: OutcomeCard[];
  pricingPlans: PricingPlan[];
  faqs: Faq[];
  team: TeamMember[];
  clients: ClientLogo[];
}
