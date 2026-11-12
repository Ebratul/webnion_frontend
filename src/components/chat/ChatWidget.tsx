'use client';

import { Bot, MessageCircle, RotateCcw, SendHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { AiPublicConfig } from '@/lib/types';
import { ChatMarkdown } from './ChatMarkdown';
import { InquiryCard } from './InquiryCard';
import { useChat } from './useChat';

interface ChatWidgetProps {
  locale: Locale;
  t: Dictionary['chat'];
  config: AiPublicConfig;
  endpoint: string;
  storageKey: string;
  // Leaves room for the WhatsApp button below it
  aboveWhatsApp?: boolean;
  // In the admin panel the button sits above the save bar
  admin?: boolean;
}

export const ChatWidget = ({ locale, t, config, endpoint, storageKey, aboveWhatsApp = false, admin = false }: ChatWidgetProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const titleId = useId();
  const button = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const { messages, busy, send, reset, setInquiryState } = useChat({ endpoint, locale, storageKey, messages: { error: t.error, limit: t.limit } });

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    // Escape closes the chat wherever focus is, even after a button inside it disappeared
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const element = list.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, open]);

  const close = () => {
    setOpen(false);
    button.current?.focus();
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!draft.trim() || busy) return;
    void send(draft);
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const bottom = admin ? 'bottom-24' : aboveWhatsApp ? 'bottom-[calc(max(1.25rem,env(safe-area-inset-bottom))+4.25rem)]' : 'bottom-5';
  // The panel sits above the buttons, and its height leaves the same room so its top never goes off a short screen
  const panelPlace = admin
    ? 'bottom-[10.5rem] max-h-[min(36rem,calc(100svh/var(--page-zoom)-11.5rem))]'
    : aboveWhatsApp
      ? 'bottom-[calc(max(1.25rem,env(safe-area-inset-bottom))+8.75rem)] max-h-[min(36rem,calc(100svh/var(--page-zoom)-max(1.25rem,env(safe-area-inset-bottom))-9.75rem))]'
      : 'bottom-24 max-h-[min(36rem,calc(100svh/var(--page-zoom)-7rem))]';
  const last = messages.at(-1);

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
        aria-label={open ? t.close : t.open}
        className={`fixed right-5 z-40 grid size-14 place-items-center rounded-full border border-white/10 bg-ink/90 shadow-soft transition-transform duration-200 hover:scale-105 ${bottom}`}
      >
        <span className="grid size-10 place-items-center rounded-full bg-primary text-white">{open ? <X aria-hidden className="size-5" /> : <MessageCircle aria-hidden className="size-5" />}</span>
      </button>

      {open && (
        <section
          role="dialog"
          aria-labelledby={titleId}
          lang={locale}
          className={`fixed inset-x-3 z-40 flex flex-col overflow-hidden rounded-3xl border border-line bg-bg text-fg shadow-soft sm:inset-x-auto sm:right-5 sm:w-[23rem] ${panelPlace}`}
        >
          <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
            <span aria-hidden className="grid size-9 place-items-center rounded-full bg-tint text-accent">
              <Bot className="size-4.5" />
            </span>
            <h2 id={titleId} className="min-w-0 flex-1 truncate text-sm font-semibold">{config.name}</h2>
            <button type="button" onClick={reset} aria-label={t.reset} title={t.reset} className="grid size-9 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-tint hover:text-fg">
              <RotateCcw aria-hidden className="size-4" />
            </button>
            <button type="button" onClick={close} aria-label={t.close} className="grid size-9 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-tint hover:text-fg">
              <X aria-hidden className="size-4" />
            </button>
          </div>

          <div ref={list} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 text-sm leading-relaxed">
            <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-surface px-3.5 py-2.5">{config.greeting}</div>
            {messages.length === 0 && config.suggestions.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {config.suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button type="button" onClick={() => void send(suggestion)} className="rounded-full border border-line px-3 py-1.5 text-left text-xs transition-colors duration-200 hover:border-primary hover:text-primary dark:hover:text-accent">
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {messages.map((message, index) =>
              message.role === 'user' ? (
                <div key={index} className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-white">
                  {message.content}
                </div>
              ) : (
                <div key={index} className="max-w-[92%]">
                  <div className={`break-words rounded-2xl rounded-tl-md px-3.5 py-2.5 ${message.error ? 'border border-red-500/30 bg-red-500/5' : 'bg-surface'}`}>
                    {message.content ? <ChatMarkdown text={message.content} /> : busy && index === messages.length - 1 ? <span className="text-muted">{t.thinking}</span> : null}
                  </div>
                  {message.sources && message.sources.length > 0 && (
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                      <span>{t.sources}:</span>
                      {message.sources.map((source) => (
                        <Link key={source.url} href={source.url} className="underline underline-offset-2 transition-colors duration-200 hover:text-primary dark:hover:text-accent">{source.title}</Link>
                      ))}
                    </p>
                  )}
                  {message.inquiry?.state === 'open' && <InquiryCard proposal={message.inquiry} locale={locale} t={t} onDone={(state) => setInquiryState(index, state)} />}
                  {message.inquiry?.state === 'sent' && <p className="mt-2 text-xs text-muted">{t.inquirySent}</p>}
                </div>
              ),
            )}
            <p aria-live="polite" className="sr-only">{!busy && last?.role === 'assistant' ? last.content : ''}</p>
          </div>

          <form onSubmit={submit} className="border-t border-line bg-surface p-3">
            <div className="flex items-end gap-2">
              <label htmlFor={`${titleId}-input`} className="sr-only">{t.placeholder}</label>
              <textarea
                id={`${titleId}-input`}
                ref={input}
                rows={1}
                maxLength={1000}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t.placeholder}
                className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-bg px-3.5 py-2.5 text-sm outline-none transition-colors duration-200 placeholder:text-muted focus:border-primary"
              />
              <button type="submit" disabled={busy || !draft.trim()} aria-label={t.send} className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-white transition-colors duration-200 hover:bg-primary-hover disabled:opacity-50">
                <SendHorizontal aria-hidden className="size-4.5" />
              </button>
            </div>
            <p className="mt-2 text-[0.6875rem] leading-snug text-muted">{t.disclaimer}</p>
          </form>
        </section>
      )}
    </>
  );
};
