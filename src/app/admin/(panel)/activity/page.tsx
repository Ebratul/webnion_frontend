import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActivityRow, type ActivityEntry } from '@/components/admin/ActivityRow';
import { cardClass, EmptyState, inputClass, PageHeader, quietButton } from '@/components/admin/ui';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

export const metadata: Metadata = { title: 'Activity Log' };

const FILTERS = [
  { value: '', label: 'Everything' },
  { value: 'INQUIRY', label: 'Inquiries' },
  { value: 'CREATE', label: 'Added' },
  { value: 'UPDATE', label: 'Changed' },
  { value: 'DELETE', label: 'Deleted' },
  { value: 'UPLOAD', label: 'Uploads' },
  { value: 'REORDER', label: 'Order' },
  { value: 'LOGIN', label: 'Logins' },
  { value: 'LOGIN_FAILED', label: 'Failed Logins' },
  { value: 'LOGOUT', label: 'Logouts' },
];

interface ActivityPage {
  items: ActivityEntry[];
  total: number;
  page: number;
  pages: number;
}

type PageProps = { searchParams: Promise<{ action?: string; q?: string; page?: string }> };

export default async function ActivityLogPage({ searchParams }: PageProps) {
  if ((await getAdminUser()).role !== 'ADMIN') notFound();

  const { action = '', q = '', page = '1' } = await searchParams;
  const query = new URLSearchParams({ page, limit: '30', ...(action ? { action } : {}), ...(q ? { q } : {}) });
  const data = await adminFetch<ActivityPage>(`/activity-logs?${query}`);

  const href = (next: { action?: string; page?: number }) => {
    const params = new URLSearchParams();
    const nextAction = next.action ?? action;
    if (nextAction) params.set('action', nextAction);
    if (q) params.set('q', q);
    if (next.page && next.page > 1) params.set('page', String(next.page));
    const text = params.toString();
    return `/admin/activity${text ? `?${text}` : ''}`;
  };

  return (
    <>
      <PageHeader title="Activity Log" count={data.total} description="Who did what on the website, and when: logins, every change in this panel, uploads and new inquiries. Times are Bangladesh time." />

      <form method="get" className="relative mb-4 sm:max-w-sm">
        {action && <input type="hidden" name="action" value={action} />}
        <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input type="search" name="q" defaultValue={q} placeholder="Search by name, email or item" aria-label="Search activity" className={`${inputClass} pl-10`} />
      </form>

      <nav aria-label="Filter activity" className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((filter) => {
          const active = filter.value === action;
          return (
            <Link
              key={filter.value}
              href={href({ action: filter.value })}
              aria-current={active ? 'true' : undefined}
              className={`inline-flex min-h-9 shrink-0 items-center rounded-full border px-4 text-xs font-medium transition-colors duration-200 ${active ? 'border-primary bg-primary text-white' : 'border-line text-muted hover:border-accent/60 hover:text-white'}`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {data.items.length === 0 ? (
        <EmptyState>{q || action ? 'Nothing matches this filter.' : 'Nothing has been recorded yet.'}</EmptyState>
      ) : (
        <ul className={`divide-y divide-line overflow-hidden ${cardClass}`}>
          {data.items.map((entry) => <ActivityRow key={entry.id} entry={entry} />)}
        </ul>
      )}

      {data.pages > 1 && (
        <nav aria-label="Pages" className="mt-5 flex items-center justify-between gap-3">
          {data.page > 1 ? <Link href={href({ page: data.page - 1 })} className={quietButton}><ChevronLeft aria-hidden className="size-4" />Newer</Link> : <span />}
          <p className="text-xs tabular-nums text-muted">Page {data.page} of {data.pages}</p>
          {data.page < data.pages ? <Link href={href({ page: data.page + 1 })} className={quietButton}>Older<ChevronRight aria-hidden className="size-4" /></Link> : <span />}
        </nav>
      )}
    </>
  );
}
