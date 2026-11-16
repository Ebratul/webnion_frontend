'use client';

import { ArrowRight, CornerDownLeft, FileText, Loader2, Plus, Search, Type, type LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import { RESOURCES } from '@/lib/admin/resources';
import { ADMIN_SCREENS, DASHBOARD, RESOURCE_ICONS } from '@/lib/admin/screens';
import { highlight, scoreMatch, searchTerms, type SearchIndex } from '@/lib/admin/search';
import { TEXT_GROUPS, textLabel } from '@/lib/admin/textGroups';

interface Item {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  href: string;
  Icon: LucideIcon;
  image?: string | null;
  keywords?: string;
}

interface Section {
  title: string;
  items: Item[];
}

// The index is fetched when the search opens and reused for a minute, so it opens instantly the next time
const FRESH_FOR = 60_000;

const Marked = ({ text, terms }: { text: string; terms: string[] }) => (
  <>
    {highlight(text, terms).map((piece, index) =>
      piece.match ? (
        <mark key={index} className="rounded-sm bg-primary/30 text-white">
          {piece.text}
        </mark>
      ) : (
        piece.text
      ),
    )}
  </>
);

const OPEN_EVENT = 'admin-search:open';

// The sidebar has a search button on desktop and an icon on phones; both open the one search box
export const AdminSearchButton = ({ compact = false }: { compact?: boolean }) => {
  const [shortcut, setShortcut] = useState('Ctrl K');
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut('⌘ K');
  }, []);
  const open = () => window.dispatchEvent(new Event(OPEN_EVENT));

  return compact ? (
    <button type="button" onClick={open} aria-label="Search admin" aria-keyshortcuts="Control+K Meta+K" className="grid size-10 place-items-center rounded-xl text-muted transition-colors duration-200 hover:bg-white/[0.05] hover:text-white">
      <Search aria-hidden className="size-4" />
    </button>
  ) : (
    <button
      type="button"
      onClick={open}
      aria-keyshortcuts="Control+K Meta+K"
      className="flex min-h-10 w-full items-center gap-3 rounded-xl border border-line bg-white/[0.03] px-3 text-sm text-muted transition-colors duration-200 hover:border-accent/50 hover:bg-white/[0.05] hover:text-white"
    >
      <Search aria-hidden className="size-4 shrink-0" />
      <span className="flex-1 text-left">Search admin…</span>
      <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-sans text-[0.6875rem] text-muted">{shortcut}</kbd>
    </button>
  );
};

// Search across the whole admin panel: screens, Website Text sections, every record, and the website's own words.
// Rendered once in the panel. Opens from AdminSearchButton, Ctrl K / ⌘ K, or "/" when not typing.
export const AdminSearch = ({ isAdmin }: { isAdmin: boolean }) => {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const loadedAt = useRef(0);
  const id = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const load = useCallback(async () => {
    if (Date.now() - loadedAt.current < FRESH_FOR) return;
    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch('/api/admin/search', { cache: 'no-store' });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      if (!response.ok) throw new Error(String(response.status));
      setIndex(await response.json());
      loadedAt.current = Date.now();
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const open = useCallback(() => {
    if (dialog.current?.open) return;
    dialog.current?.showModal();
    input.current?.select();
    void load();
  }, [load]);

  // Ctrl K / ⌘ K anywhere, and "/" unless the person is typing in a field
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing = target?.closest('input, textarea, select, [contenteditable="true"]');
      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_EVENT, open);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_EVENT, open);
    };
  }, [open]);

  // The panel's own screens never change while it is open, so they are built once
  const pages = useMemo<Item[]>(() => {
    const screens = [DASHBOARD, ...ADMIN_SCREENS].filter((screen) => !screen.adminOnly || isAdmin);
    const resources = RESOURCES.filter((resource) => !resource.adminOnly || isAdmin);
    return [
      ...screens.map((screen) => ({ id: screen.href, title: screen.label, subtitle: screen === DASHBOARD ? 'Overview' : screen.group, tag: 'Page', href: screen.href, Icon: screen.Icon, keywords: screen.keywords })),
      ...resources.map((resource) => ({
        id: `/admin/${resource.key}`,
        title: resource.label,
        subtitle: resource.group,
        tag: 'Page',
        href: `/admin/${resource.key}`,
        Icon: RESOURCE_ICONS[resource.key] ?? FileText,
        keywords: `${resource.singular} ${resource.description}`,
      })),
      ...TEXT_GROUPS.map((group) => ({
        id: `text-${group.key}`,
        title: group.label,
        subtitle: `Website Text · ${group.hint}`,
        tag: 'Text',
        href: `/admin/website-text?group=${group.key}`,
        Icon: Type,
        keywords: 'text words heading',
      })),
    ];
  }, [isAdmin]);

  const creates = useMemo<Item[]>(
    () =>
      RESOURCES.filter((resource) => resource.canCreate && (!resource.adminOnly || isAdmin)).map((resource) => ({
        id: `new-${resource.key}`,
        title: `New ${resource.singular}`,
        subtitle: resource.label,
        tag: 'Add',
        href: `/admin/${resource.key}/new`,
        Icon: Plus,
        keywords: `add create ${resource.label}`,
      })),
    [isAdmin],
  );

  const terms = useMemo(() => searchTerms(query), [query]);

  const sections = useMemo<Section[]>(() => {
    // With nothing typed: every screen in menu order, as a quick way to jump
    if (terms.length === 0) return [{ title: 'Go to', items: pages.filter((page) => page.tag === 'Page') }];

    const rank = (items: Item[], limit: number) =>
      items
        .map((item) => ({ item, score: scoreMatch(terms, item.title, item.subtitle, item.keywords) }))
        .filter((entry) => entry.score > 0)
        // Screens come before Website Text sections with similar names
        .map((entry) => ({ ...entry, score: entry.score + (entry.item.tag === 'Page' ? 5 : 0) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry) => entry.item);

    const records: Item[] = (index?.records ?? []).map((record, at) => {
      const resource = RESOURCES.find((item) => item.key === record.resource);
      return {
        id: `record-${at}`,
        title: record.title,
        subtitle: record.subtitle,
        tag: resource?.singular ?? 'Record',
        href: record.href,
        Icon: RESOURCE_ICONS[record.resource] ?? FileText,
        image: record.image,
        keywords: `${resource?.label ?? ''} ${resource?.singular ?? ''}`,
      };
    });

    // The site's own words, in either language. Three letters at least, or nearly every sentence would match.
    const needle = query.trim().toLowerCase();
    const texts: Item[] =
      needle.length < 3
        ? []
        : (index?.texts ?? [])
            .flatMap((text) => {
              const value = text.en.toLowerCase().includes(needle) ? text.en : text.bn.toLowerCase().includes(needle) ? text.bn : null;
              if (!value) return [];
              const group = TEXT_GROUPS.find((item) => item.key === text.path.split('.')[0]);
              return [{
                id: `text-${text.path}`,
                title: value.length > 120 ? `${value.slice(0, 117)}…` : value,
                subtitle: `Website Text · ${group?.label ?? 'Other'} · ${textLabel(text.path)}`,
                tag: 'Text',
                href: `/admin/website-text?q=${encodeURIComponent(query.trim())}`,
                Icon: Type,
              }];
            })
            .slice(0, 6);

    return [
      { title: 'Pages', items: rank(pages, 8) },
      { title: 'Add New', items: rank(creates, 3) },
      { title: 'Records', items: rank(records, 10) },
      { title: 'Text on the website', items: texts },
    ].filter((section) => section.items.length > 0);
  }, [terms, query, pages, creates, index]);

  const flat = useMemo(() => sections.flatMap((section) => section.items), [sections]);

  // A new search starts from its best result
  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (item: Item | undefined) => {
    if (!item) return;
    dialog.current?.close();
    router.push(item.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') setActive((at) => (flat.length ? (at + 1) % flat.length : 0));
    else if (event.key === 'ArrowUp') setActive((at) => (flat.length ? (at - 1 + flat.length) % flat.length : 0));
    else if (event.key === 'Home') setActive(0);
    else if (event.key === 'End') setActive(Math.max(flat.length - 1, 0));
    else if (event.key === 'Enter') go(flat[active]);
    else return;
    event.preventDefault();
  };

  let position = -1;

  return (
    <>
      <dialog
        ref={dialog}
        aria-label="Search admin"
        onClose={() => setQuery('')}
        onClick={(event) => {
          // A click on the dimmed area outside the box closes it
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        className="admin-search mx-auto mb-auto mt-[10vh] w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          {loading && !index ? <Loader2 aria-hidden className="size-5 shrink-0 animate-spin text-accent" /> : <Search aria-hidden className="size-5 shrink-0 text-accent" />}
          <input
            ref={input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-activedescendant={flat[active] ? `${id}-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Search pages, records and website text"
            placeholder="Search pages, projects, reviews, inquiries, text…"
            autoComplete="off"
            spellCheck={false}
            className="min-h-14 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-muted"
          />
          <kbd className="hidden rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-sans text-[0.6875rem] text-muted sm:block">Esc</kbd>
        </div>

        {/* Focusable so a long list can also be scrolled with the keyboard; the arrows in the box move the selection */}
        <div tabIndex={0} className="max-h-[min(28rem,60vh)] overflow-y-auto overscroll-contain p-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent">
          {flat.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">
              {loading ? 'Loading records…' : `Nothing found for “${query.trim()}”. Try another word, such as a project name or an email.`}
            </p>
          ) : (
            <ul ref={list} id={`${id}-list`} role="listbox" aria-label="Results">
              {sections.map((section) => (
                <li key={section.title} role="presentation">
                  <p className="px-3 pb-1.5 pt-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted/80">{section.title}</p>
                  <ul role="presentation">
                    {section.items.map((item) => {
                      position += 1;
                      const at = position;
                      const selected = at === active;
                      return (
                        <li
                          key={item.id}
                          id={`${id}-${at}`}
                          data-index={at}
                          role="option"
                          aria-selected={selected}
                          onClick={() => go(item)}
                          onMouseMove={() => !selected && setActive(at)}
                          className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-150 ${selected ? 'bg-primary/20' : ''}`}
                        >
                          {item.image ? (
                            <img src={item.image} alt="" loading="lazy" className="size-9 shrink-0 rounded-lg bg-surface-2 object-cover" />
                          ) : (
                            <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${selected ? 'bg-primary text-white' : 'bg-tint text-accent'}`}>
                              <item.Icon aria-hidden className="size-4" />
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              <Marked text={item.title} terms={terms} />
                            </span>
                            {item.subtitle && (
                              <span className="block truncate text-xs text-muted">
                                <Marked text={item.subtitle} terms={terms} />
                              </span>
                            )}
                          </span>
                          <span className="hidden shrink-0 rounded-full border border-line px-2 py-0.5 text-[0.6875rem] text-muted sm:inline">{item.tag}</span>
                          <ArrowRight aria-hidden className={`size-4 shrink-0 text-accent transition-opacity duration-150 ${selected ? 'opacity-100' : 'opacity-0'}`} />
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          {(failed || (index?.failed ?? 0) > 0) && (
            <p role="status" className="px-3 pb-2 pt-3 text-xs text-amber-300">
              {failed ? 'Records could not be loaded, so only pages are searched. Close and open the search to try again.' : 'Some lists could not be loaded, so a few records may be missing.'}
            </p>
          )}
        </div>

        <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 text-[0.6875rem] text-muted sm:flex">
          <span className="flex items-center gap-1.5"><kbd className="rounded border border-line px-1">↑</kbd><kbd className="rounded border border-line px-1">↓</kbd> to move</span>
          <span className="flex items-center gap-1.5"><CornerDownLeft aria-hidden className="size-3" /> to open</span>
          <span className="flex items-center gap-1.5"><kbd className="rounded border border-line px-1">Esc</kbd> to close</span>
        </div>
      </dialog>
    </>
  );
};
