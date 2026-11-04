import { ArrowUpRight, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin/session';

export const metadata: Metadata = { title: 'Dashboard' };

interface Inquiry {
  id: string;
  name: string;
  email: string;
  status: string;
  message: string;
  createdAt: string;
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function AdminDashboardPage() {
  const [projects, reviews, caseStudies, inquiries] = await Promise.all([
    adminFetch<unknown[]>('/projects/all'),
    adminFetch<unknown[]>('/testimonials/all'),
    adminFetch<unknown[]>('/case-studies/all'),
    adminFetch<Inquiry[]>('/inquiries'),
  ]);

  const stats = [
    { label: 'Projects', value: projects.length, href: '/admin/projects' },
    { label: 'Customer Reviews', value: reviews.length, href: '/admin/testimonials' },
    { label: 'Case Studies', value: caseStudies.length, href: '/admin/case-studies' },
    { label: 'New Inquiries', value: inquiries.filter((inquiry) => inquiry.status === 'NEW').length, href: '/admin/inquiries' },
  ];
  const recent = inquiries.slice(0, 5);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Everything on your website, in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/testimonials/new" className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-accent hover:text-accent">
            <Plus aria-hidden className="size-4" />
            New Review
          </Link>
          <Link href="/admin/projects/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-[background-color] duration-200 hover:bg-primary-hover">
            <Plus aria-hidden className="size-4" />
            New Project
          </Link>
        </div>
      </header>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link href={stat.href} className="group block rounded-2xl border border-line bg-surface p-5 transition-colors duration-200 hover:border-accent/60">
              <span className="flex items-start justify-between text-xs text-muted">
                {stat.label}
                <ArrowUpRight aria-hidden className="size-3.5 transition-colors duration-200 group-hover:text-accent" />
              </span>
              <span className="mt-3 block text-3xl font-semibold">{stat.value}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Latest Inquiries</h2>
          <Link href="/admin/inquiries" className="text-xs font-medium text-accent">View All</Link>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">No inquiries yet.</p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
            {recent.map((inquiry) => (
              <li key={inquiry.id}>
                <Link href={`/admin/inquiries/${inquiry.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-200 hover:bg-white/[0.03]">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{inquiry.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{inquiry.message}</p>
                  </div>
                  <span className="hidden shrink-0 text-xs text-muted sm:block">{dateFormat.format(new Date(inquiry.createdAt))}</span>
                  {inquiry.status === 'NEW' && <span className="shrink-0 rounded-full bg-tint px-2 py-0.5 text-[0.625rem] font-medium text-accent">New</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
