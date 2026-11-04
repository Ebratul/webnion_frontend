'use client';

import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { getResource } from '@/lib/admin/resources';
import { inputClass } from './fields';

type Row = Record<string, unknown> & { id: string };

const rowAction =
  'grid size-9 place-items-center rounded-lg text-muted transition-colors duration-200 hover:bg-white/5 hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent';

export const ResourceList = ({ resourceKey, rows }: { resourceKey: string; rows: Row[] }) => {
  const resource = getResource(resourceKey)!;
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => `${resource.rowTitle(row)} ${resource.rowSubtitle(row)}`.toLowerCase().includes(needle));
  }, [query, resource, rows]);

  const send = async (id: string, method: 'PATCH' | 'DELETE', body?: object) => {
    const response = await fetch(`/api/admin${resource.apiPath}/${id}`, {
      method,
      ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      const result: { message?: string } = await response.json().catch(() => ({}));
      throw new Error(result.message ?? 'Something went wrong. Please try again.');
    }
  };

  const run = (work: () => Promise<void>) => {
    setError(null);
    startTransition(async () => {
      try {
        await work();
        router.refresh();
      } catch (workError) {
        setError(workError instanceof Error ? workError.message : 'Something went wrong. Please try again.');
      }
    });
  };

  const move = (index: number, delta: number) =>
    run(async () => {
      const next = [...rows];
      const [row] = next.splice(index, 1);
      next.splice(index + delta, 0, row!);
      // Every row gets its position, which also repairs records that share the same sort number
      await Promise.all(next.map((item, position) => (item.sortOrder === position ? null : send(item.id, 'PATCH', { sortOrder: position }))));
    });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-56 flex-1 sm:max-w-sm">
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${resource.label.toLowerCase()}`} aria-label={`Search ${resource.label}`} className={`${inputClass} pl-10`} />
        </div>
        {resource.canCreate && (
          <Link
            href={`/admin/${resource.key}/new`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-[background-color] duration-200 hover:bg-primary-hover"
          >
            <Plus aria-hidden className="size-4" />
            New {resource.singular}
          </Link>
        )}
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-300">{error}</p>}

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
          {query ? 'Nothing matches your search.' : `No ${resource.label.toLowerCase()} yet.`}
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
          {visible.map((row) => {
            const index = rows.indexOf(row);
            const hidden = row.isActive === false;
            const image = resource.rowImage?.(row);
            const badge = resource.rowBadge?.(row);
            const canReorder = resource.sortable && !query;

            return (
              <li key={row.id} className="flex items-center gap-4 px-4 py-3 sm:px-5">
                {resource.rowImage && (
                  <div className={`size-12 shrink-0 overflow-hidden rounded-xl bg-white/5 ${hidden ? 'opacity-40' : ''}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {image && <img src={image} alt="" loading="lazy" className="size-full object-cover" />}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/${resource.key}/${row.id}`} className="truncate text-sm font-medium transition-colors duration-200 hover:text-accent">
                      {resource.rowTitle(row)}
                    </Link>
                    {badge && <span className="shrink-0 rounded-full border border-line bg-tint px-2 py-0.5 text-[0.625rem] font-medium text-accent">{badge}</span>}
                    {hidden && <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[0.625rem] text-muted">Hidden</span>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">{resource.rowSubtitle(row)}</p>
                </div>

                {confirming === row.id ? (
                  <div className="flex shrink-0 items-center gap-2 text-xs">
                    <span className="hidden text-muted sm:inline">Delete permanently?</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setConfirming(null);
                        run(() => send(row.id, 'DELETE'));
                      }}
                      className="rounded-full bg-red-500 px-3 py-1.5 font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                    >
                      Delete
                    </button>
                    <button type="button" onClick={() => setConfirming(null)} className="rounded-full border border-line px-3 py-1.5 transition-colors duration-200 hover:border-accent">
                      Keep
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center">
                    {canReorder && (
                      <span className="hidden sm:contents">
                        <button type="button" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label={`Move ${resource.rowTitle(row)} up`} className={rowAction}>
                          <ArrowUp aria-hidden className="size-4" />
                        </button>
                        <button type="button" disabled={busy || index === rows.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${resource.rowTitle(row)} down`} className={rowAction}>
                          <ArrowDown aria-hidden className="size-4" />
                        </button>
                      </span>
                    )}
                    {'isActive' in row && resource.sortable && (
                      <button type="button" disabled={busy} onClick={() => run(() => send(row.id, 'PATCH', { isActive: hidden }))} aria-label={hidden ? `Show ${resource.rowTitle(row)}` : `Hide ${resource.rowTitle(row)}`} className={rowAction}>
                        {hidden ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
                      </button>
                    )}
                    {resource.publicHref && !hidden && (
                      <a href={resource.publicHref(row)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${resource.rowTitle(row)} on the website`} className={rowAction}>
                        <ExternalLink aria-hidden className="size-4" />
                      </a>
                    )}
                    <Link href={`/admin/${resource.key}/${row.id}`} aria-label={`Edit ${resource.rowTitle(row)}`} className={rowAction}>
                      <Pencil aria-hidden className="size-4" />
                    </Link>
                    {resource.canDelete && (
                      <button type="button" onClick={() => setConfirming(row.id)} aria-label={`Delete ${resource.rowTitle(row)}`} className={`${rowAction} hover:text-red-400`}>
                        <Trash2 aria-hidden className="size-4" />
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
