'use client';

import { X } from 'lucide-react';
import { Suspense, useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { InquiryForm } from './InquiryForm';

const OPEN_EVENT = 'webnion:open-inquiry';

export const openInquiryDialog = () => window.dispatchEvent(new Event(OPEN_EVENT));

export const InquiryButton = ({ className, children }: { className?: string; children: ReactNode }) => (
  <button type="button" onClick={openInquiryDialog} className={className}>
    {children}
  </button>
);

interface InquiryDialogProps {
  locale: Locale;
  t: Dictionary['inquiry'];
  closeLabel: string;
  options: { slug: string; label: string }[];
}

export const InquiryDialog = ({ locale, t, closeLabel, options }: InquiryDialogProps) => {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const open = () => {
      if (!dialog.current?.open) dialog.current?.showModal();
    };
    window.addEventListener(OPEN_EVENT, open);
    // A shared link such as /en?service=custom-website-design opens straight on the form
    if (new URLSearchParams(window.location.search).has('service')) open();
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  // A reload after closing should not bring the form back
  const clearServiceFromUrl = () => {
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
  };

  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) dialog.current?.close();
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="inquiry-form-title"
      onClose={clearServiceFromUrl}
      onClick={closeOnBackdrop}
      className="m-auto w-[min(44rem,92vw)] overflow-hidden rounded-3xl border border-line bg-bg text-left text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="max-h-[90svh] overflow-y-auto overscroll-contain p-6 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <h2 id="inquiry-form-title" className="text-2xl font-semibold">{t.formTitle}</h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label={closeLabel}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-line transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <p className="mb-7 mt-2 text-sm text-muted">{t.formSubtitle}</p>
        <Suspense>
          <InquiryForm locale={locale} t={t} options={options} />
        </Suspense>
      </div>
    </dialog>
  );
};
