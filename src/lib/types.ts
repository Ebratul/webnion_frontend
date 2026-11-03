export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  image: string;
  url: string | null;
  isFeatured: boolean;
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

export interface PricingPlan {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  badge: string | null;
  price: number;
  currency: string;
  features: string[];
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
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
  deliveryStories: DeliveryStory[];
  pricingPlans: PricingPlan[];
  faqs: Faq[];
  team: TeamMember[];
  clients: ClientLogo[];
}
