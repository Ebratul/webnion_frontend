import {
  BadgeDollarSign,
  BarChart3,
  Bot,
  Building2,
  Camera,
  CircleHelp,
  Cpu,
  FileText,
  FolderKanban,
  History,
  House,
  Image as ImageIcon,
  Inbox,
  Layers,
  LayoutDashboard,
  LayoutPanelTop,
  MessageSquareQuote,
  Newspaper,
  Package,
  Palette,
  PanelsTopLeft,
  ShieldBan,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Type,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Resource } from './resources';

// The admin menu and the admin search share these, so a new screen shows up in both

export const RESOURCE_ICONS: Record<string, LucideIcon> = {
  projects: FolderKanban,
  testimonials: MessageSquareQuote,
  'case-studies': FileText,
  products: Package,
  services: Layers,
  'hero-backgrounds': ImageIcon,
  'pricing-plans': BadgeDollarSign,
  faqs: CircleHelp,
  team: Users,
  clients: Building2,
  'outcome-cards': LayoutPanelTop,
  'delivery-stories': Camera,
  technologies: Cpu,
  inquiries: Inbox,
  'blog-posts': Newspaper,
  users: UserCog,
};

export interface AdminScreen {
  group: Resource['group'];
  href: string;
  label: string;
  Icon: LucideIcon;
  // Other words people may type to find it
  keywords: string;
  adminOnly?: boolean;
  // Placed after the group's record lists, such as Spam Filter under Inquiries
  last?: boolean;
}

export const DASHBOARD: AdminScreen = { group: 'Content', href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, keywords: 'home overview start' };

// Screens that are not lists of records
export const ADMIN_SCREENS: AdminScreen[] = [
  { group: 'Website', href: '/admin/homepage', label: 'Homepage', Icon: House, keywords: 'sections order hide show layout home page' },
  { group: 'Website', href: '/admin/brand', label: 'Brand', Icon: Palette, keywords: 'logo colour color site name favicon icon' },
  { group: 'Website', href: '/admin/navigation', label: 'Menu & Footer', Icon: PanelsTopLeft, keywords: 'menu header footer links navigation social facebook instagram offices address' },
  { group: 'Website', href: '/admin/pricing-page', label: 'Pricing Page', Icon: Tags, keywords: 'pricing page included steps extras lists' },
  { group: 'Website', href: '/admin/website-text', label: 'Website Text', Icon: Type, keywords: 'text words headings labels sentences translate bangla copy' },
  { group: 'Website', href: '/admin/settings', label: 'Contact & Links', Icon: SlidersHorizontal, keywords: 'contact phone email whatsapp address inquiry emails budgets taka dollar prices map privacy pictures' },
  { group: 'Content', href: '/admin/ai-studio', label: 'AI Studio', Icon: Sparkles, keywords: 'ai write blog article generate pictures draft' },
  { group: 'Leads', href: '/admin/spam-filter', label: 'Spam Filter', Icon: ShieldBan, keywords: 'spam block blocked email domain words cooldown links', last: true },
  { group: 'Settings', href: '/admin/ai-settings', label: 'AI Settings', Icon: Bot, keywords: 'ai chat assistant keys model provider pinecone', adminOnly: true },
  { group: 'Settings', href: '/admin/ai-usage', label: 'AI Usage', Icon: BarChart3, keywords: 'ai usage cost tokens spending', adminOnly: true },
  { group: 'Settings', href: '/admin/activity', label: 'Activity Log', Icon: History, keywords: 'activity history log changes who edited', adminOnly: true },
];
