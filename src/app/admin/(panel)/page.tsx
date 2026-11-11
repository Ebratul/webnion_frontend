import { ArrowUpRight, FileText, House, Palette, PanelsTopLeft, FolderKanban, History, Inbox, Layers, MessageSquareQuote, Package, Plus, SlidersHorizontal, Type, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ActivityRow, formatWhen, type ActivityEntry } from '@/components/admin/ActivityRow';
import { cardClass, EmptyState, hoverCardClass, PageHeader, primaryButton, quietButton } from '@/components/admin/ui';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

export const metadata: Metadata = { title: 'Dashboard' };

interface Inquiry {
  id: string;
  name: string;
  email: string;
  status: string;
  message: string;
  createdAt: string;
}

const SHORTCUTS: { href: string; label: string; text: string; Icon: LucideIcon }[] = [
  { href: '/admin/homepage', label: 'Homepage', text: 'Every section in order: show, hide or edit it.', Icon: House },
  { href: '/admin/brand', label: 'Brand', text: 'Name, logo, colour and browser tab icon.', Icon: Palette },
  { href: '/admin/website-text', label: 'Website Text', text: 'Any heading or sentence, in both languages.', Icon: Type },
  { href: '/admin/navigation', label: 'Menu & Footer', text: 'Menu links, footer links, social links, offices.', Icon: PanelsTopLeft },
];

const greetingHour = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: 'numeric', hour12: false });

const greeting = () => {
  const hour = Number(greetingHour.format(new Date()));
  if (hour < 12) return 'Good morning';
  return hour < 18 ? 'Good afternoon' : 'Good evening';
};

const SectionTitle = ({ title, href }: { title: string; href: string }) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h2 className="text-base font-semibold">{title}</h2>
    <Link href={href} className="inline-flex min-h-6 items-center text-xs font-medium text-accent transition-colors duration-200 hover:text-white">View All</Link>
  </div>
);

export default async function AdminDashboardPage() {
  const user = await getAdminUser();
  const [projects, reviews, caseStudies, products, services, inquiries, activity] = await Promise.all([
    adminFetch<unknown[]>('/projects/all'),
    adminFetch<unknown[]>('/testimonials/all'),
    adminFetch<unknown[]>('/case-studies/all'),
    adminFetch<unknown[]>('/products/all'),
    adminFetch<unknown[]>('/services/all'),
    adminFetch<Inquiry[]>('/inquiries'),
    // Editors cannot read the log, which holds IP addresses and login attempts
    user.role === 'ADMIN' ? adminFetch<{ items: ActivityEntry[] }>('/activity-logs?limit=6') : Promise.resolve(null),
  ]);

  const stats: { label: string; value: number; href: string; Icon: LucideIcon; strong?: boolean }[] = [
    { label: 'New Inquiries', value: inquiries.filter((inquiry) => inquiry.status === 'NEW').length, href: '/admin/inquiries', Icon: Inbox, strong: true },
    { label: 'Projects', value: projects.length, href: '/admin/projects', Icon: FolderKanban },
    { label: 'Customer Reviews', value: reviews.length, href: '/admin/testimonials', Icon: MessageSquareQuote },
    { label: 'Case Studies', value: caseStudies.length, href: '/admin/case-studies', Icon: FileText },
    { label: 'Products', value: products.length, href: '/admin/products', Icon: Package },
    { label: 'Services', value: services.length, href: '/admin/services', Icon: Layers },
  ];
  const recent = inquiries.slice(0, 6);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        description="Everything on your website, in one place."
        actions={
          <>
            <Link href="/admin/testimonials/new" className={quietButton}><Plus aria-hidden className="size-4" />New Review</Link>
            <Link href="/admin/projects/new" className={primaryButton}><Plus aria-hidden className="size-4" />New Project</Link>
          </>
        }
      />

      <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value, href, Icon, strong }) => (
          <li key={label}>
            <Link href={href} className={`group flex h-full flex-col justify-between gap-5 p-5 ${hoverCardClass} ${strong && value > 0 ? 'border-primary/60' : ''}`}>
              <span className="flex items-center justify-between">
                <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-tint text-accent"><Icon className="size-[1.125rem]" /></span>
                <ArrowUpRight aria-hidden className="size-4 text-muted transition-colors duration-200 group-hover:text-accent" />
              </span>
              <span>
                <span className="block text-[1.75rem] font-semibold leading-none tabular-nums">{value}</span>
                <span className="mt-2 block text-xs text-muted">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {SHORTCUTS.map(({ href, label, text, Icon }) => (
          <li key={href}>
            <Link href={href} className={`flex h-full items-start gap-4 p-5 ${hoverCardClass}`}>
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-accent"><Icon className="size-[1.125rem]" /></span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">{text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={`mt-8 grid items-start gap-5 [&>*]:min-w-0 ${activity ? 'xl:grid-cols-2' : ''}`}>
        <section>
          <SectionTitle title="Latest Inquiries" href="/admin/inquiries" />
          {recent.length === 0 ? (
            <EmptyState>No inquiries yet.</EmptyState>
          ) : (
            <ul className={`divide-y divide-line overflow-hidden ${cardClass}`}>
              {recent.map((inquiry) => (
                <li key={inquiry.id}>
                  <Link href={`/admin/inquiries/${inquiry.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.025]">
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-sm font-semibold text-accent">{(inquiry.name || inquiry.email).charAt(0).toUpperCase()}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{inquiry.name || inquiry.email}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">{inquiry.message}</p>
                      <time dateTime={inquiry.createdAt} className="mt-0.5 block text-xs text-muted">{formatWhen(inquiry.createdAt)}</time>
                    </div>
                    {inquiry.status === 'NEW' && <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-[0.6875rem] font-semibold text-white">New</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {activity && (
          <section>
            <SectionTitle title="Recent Activity" href="/admin/activity" />
            {activity.items.length === 0 ? (
              <EmptyState><History aria-hidden className="mx-auto mb-3 size-5" />Nothing has been recorded yet.</EmptyState>
            ) : (
              <ul className={`divide-y divide-line overflow-hidden ${cardClass}`}>
                {activity.items.map((entry) => <ActivityRow key={entry.id} entry={entry} />)}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}
