import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

// The admin panel's one set of measurements. Cards sit gap-5 apart with p-6 inside (p-7 from sm), page blocks mt-8 apart,
// and list rows px-5 py-4, so every screen lines up with the next.
export const cardClass = 'rounded-2xl border border-line bg-surface';
export const cardPadding = 'p-6 sm:p-7';
export const hoverCardClass = `${cardClass} transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface-2 motion-reduce:hover:translate-y-0`;
export const primaryButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_var(--primary)] transition-[background-color,box-shadow] duration-200 hover:bg-primary-hover hover:shadow-[0_14px_28px_-12px_var(--primary)] disabled:opacity-60';
export const quietButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-5 text-sm font-medium text-fg transition-[border-color,color,background-color] duration-200 hover:border-accent/60 hover:bg-tint hover:text-white';

export const inputClass =
  'min-h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-fg transition-[border-color,box-shadow] duration-200 placeholder:text-muted/70 hover:border-white/25 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25';

export const labelClass = 'block text-sm font-medium';

interface PageHeaderProps {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  count?: number;
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, back, count, actions }: PageHeaderProps) => (
  <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
    <div className="min-w-0 max-w-2xl">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex min-h-6 items-center gap-1.5 text-xs font-medium text-muted transition-colors duration-200 hover:text-white">
          <ArrowLeft aria-hidden className="size-3.5" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h1>
        {count !== undefined && <span className="rounded-full bg-tint px-2.5 py-0.5 text-xs font-semibold tabular-nums text-accent">{count}</span>}
      </div>
      {description && <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
  </header>
);

export const EmptyState = ({ children }: { children: ReactNode }) => (
  <p className="rounded-2xl border border-dashed border-line px-6 py-16 text-center text-sm text-muted">{children}</p>
);

interface SaveBarProps {
  saving: boolean;
  saved: boolean;
  error: string | null;
  label: string;
}

// Stays in view on long forms. Its edges follow the page content beside the sidebar.
export const SaveBar = ({ saving, saved, error, label }: SaveBarProps) => (
  <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/90 backdrop-blur-xl lg:left-[17rem]">
    <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-5 py-3 sm:px-8 lg:px-10">
      {error && <p role="alert" className="mr-auto text-xs text-red-400">{error}</p>}
      {saved && (
        <p role="status" className="mr-auto inline-flex items-center gap-1.5 text-xs text-muted">
          <Check aria-hidden className="size-3.5 text-accent" />
          Saved. The website is updated.
        </p>
      )}
      <button type="submit" disabled={saving} className={primaryButton}>
        {saving ? 'Saving…' : label}
      </button>
    </div>
  </div>
);
