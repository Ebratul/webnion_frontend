import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cardClass, EmptyState, PageHeader } from '@/components/admin/ui';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

export const metadata: Metadata = { title: 'AI Usage' };

interface UsageRow {
  day: string;
  feature: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  pictures: number;
  errors: number;
  estimatedCost: number;
}

const FEATURES: Record<string, string> = {
  chat: 'Website chat',
  'chat-admin': 'Admin chat',
  outline: 'Blog outlines',
  write: 'Blog drafts',
  translate: 'Bangla translations',
  picture: 'Pictures',
  index: 'Search index',
  test: 'Model tests',
};

const RANGES = [7, 30, 90];
const number = new Intl.NumberFormat('en-US');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 });

type PageProps = { searchParams: Promise<{ days?: string }> };

export default async function AiUsagePage({ searchParams }: PageProps) {
  if ((await getAdminUser()).role !== 'ADMIN') notFound();
  const requested = Number((await searchParams).days);
  const days = RANGES.includes(requested) ? requested : 30;
  const rows = await adminFetch<UsageRow[]>(`/ai/usage?days=${days}`);

  const totals = Object.values(
    rows.reduce<Record<string, UsageRow>>((all, row) => {
      const total = (all[row.feature] ??= { ...row, day: '', requests: 0, inputTokens: 0, outputTokens: 0, pictures: 0, errors: 0, estimatedCost: 0 });
      total.requests += row.requests;
      total.inputTokens += row.inputTokens;
      total.outputTokens += row.outputTokens;
      total.pictures += row.pictures;
      total.errors += row.errors;
      total.estimatedCost += row.estimatedCost;
      return all;
    }, {}),
  ).sort((a, b) => b.requests - a.requests);
  const cost = totals.reduce((sum, row) => sum + row.estimatedCost, 0);

  const cell = 'px-4 py-3 text-right tabular-nums';
  return (
    <>
      <PageHeader title="AI Usage" description="Requests, tokens and pictures per day (UTC). The cost is an estimate from the prices entered in AI Settings; the provider’s bill is what counts." />

      <nav aria-label="Period" className="mb-5 flex gap-2">
        {RANGES.map((range) => (
          <Link key={range} href={`/admin/ai-usage?days=${range}`} aria-current={range === days ? 'page' : undefined} className={`inline-flex min-h-9 items-center rounded-full border px-4 text-sm ${range === days ? 'border-primary bg-primary text-white' : 'border-line text-muted hover:text-white'}`}>
            Last {range} days
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState>No AI use in this period yet.</EmptyState>
      ) : (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            {[
              ['Requests', number.format(totals.reduce((sum, row) => sum + row.requests, 0))],
              ['Pictures', number.format(totals.reduce((sum, row) => sum + row.pictures, 0))],
              ['Estimated cost', money.format(cost)],
            ].map(([label, value]) => (
              <div key={label} className={`${cardClass} p-5`}>
                <p className="text-xs text-muted">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          <div className={`${cardClass} overflow-x-auto`}>
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">Usage by feature</caption>
              <thead className="border-b border-line text-xs text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Feature</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Requests</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Tokens in</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Tokens out</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Pictures</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Errors</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Est. cost</th>
                </tr>
              </thead>
              <tbody>
                {totals.map((row) => (
                  <tr key={row.feature} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium">{FEATURES[row.feature] ?? row.feature}</th>
                    <td className={cell}>{number.format(row.requests)}</td>
                    <td className={cell}>{number.format(row.inputTokens)}</td>
                    <td className={cell}>{number.format(row.outputTokens)}</td>
                    <td className={cell}>{number.format(row.pictures)}</td>
                    <td className={`${cell} ${row.errors ? 'text-amber-300' : ''}`}>{number.format(row.errors)}</td>
                    <td className={cell}>{money.format(row.estimatedCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="mt-5">
            <summary className="cursor-pointer text-sm text-muted hover:text-white">By day</summary>
            <ul className="mt-3 space-y-1 text-sm">
              {rows.map((row) => (
                <li key={`${row.day}-${row.feature}`} className="flex flex-wrap justify-between gap-2 rounded-lg px-3 py-1.5 odd:bg-white/[0.02]">
                  <span>{row.day} · {FEATURES[row.feature] ?? row.feature}</span>
                  <span className="tabular-nums text-muted">{number.format(row.requests)} requests{row.pictures ? `, ${row.pictures} pictures` : ''}{row.errors ? `, ${row.errors} errors` : ''}</span>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </>
  );
}
