'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';

export interface InquiryProposal {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; url: string }[];
  inquiry?: InquiryProposal & { state: 'open' | 'sent' | 'dismissed' };
  error?: boolean;
}

const MAX_STORED = 30;
const MAX_SENT = 10;

const readStored = (key: string): ChatMessage[] => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? (parsed as ChatMessage[]).slice(-MAX_STORED) : [];
  } catch {
    return [];
  }
};

// Sends the conversation and reads the streamed answer. The browser keeps the conversation for this visit only.
export const useChat = ({ endpoint, locale, storageKey, messages: labels }: { endpoint: string; locale: Locale; storageKey: string; messages: { error: string; limit: string } }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages(readStored(storageKey));
  }, [storageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      // Private browsing or a full store: the chat still works for this page
    }
  }, [messages, storageKey]);

  useEffect(() => () => abort.current?.abort(), []);

  const updateLast = (change: (message: ChatMessage) => ChatMessage) =>
    setMessages((current) => {
      const next = [...current];
      next[next.length - 1] = change(next[next.length - 1]!);
      return next;
    });

  const send = useCallback(
    async (text: string) => {
      const content = text.trim().slice(0, 1000);
      if (!content || busy) return;
      const history = [...messages.filter((message) => !message.error && message.content), { role: 'user' as const, content }];
      setMessages((current) => [...current, { role: 'user', content }, { role: 'assistant', content: '' }]);
      setBusy(true);
      abort.current = new AbortController();

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale, messages: history.slice(-MAX_SENT).map(({ role, content: body }) => ({ role, content: body.slice(0, 2000) })) }),
          signal: abort.current.signal,
        });
        if (!response.ok || !response.body) {
          const body: { message?: string } = await response.json().catch(() => ({}));
          updateLast((message) => ({ ...message, content: response.status === 429 ? body.message || labels.limit : labels.error, error: true }));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';
          for (const part of parts) {
            const line = part.split('\n').find((item) => item.startsWith('data: '));
            if (!line) continue;
            let event: { type: string; text?: string; items?: ChatMessage['sources']; proposal?: InquiryProposal; message?: string };
            try {
              event = JSON.parse(line.slice(6));
            } catch {
              continue;
            }
            if (event.type === 'token' && event.text) updateLast((message) => ({ ...message, content: message.content + event.text }));
            else if (event.type === 'sources') updateLast((message) => ({ ...message, sources: event.items?.slice(0, 3) }));
            else if (event.type === 'inquiry' && event.proposal) updateLast((message) => ({ ...message, inquiry: { ...event.proposal!, state: 'open' } }));
            else if (event.type === 'error') updateLast((message) => ({ ...message, content: message.content || event.message || labels.error, error: !message.content }));
          }
        }
        updateLast((message) => (message.content || message.inquiry ? message : { ...message, content: labels.error, error: true }));
      } catch (error) {
        if ((error as Error).name !== 'AbortError') updateLast((message) => ({ ...message, content: message.content || labels.error, error: !message.content }));
      } finally {
        setBusy(false);
      }
    },
    [busy, endpoint, labels.error, labels.limit, locale, messages],
  );

  const setInquiryState = (index: number, state: 'sent' | 'dismissed') =>
    setMessages((current) => current.map((message, position) => (position === index && message.inquiry ? { ...message, inquiry: { ...message.inquiry, state } } : message)));

  const reset = () => {
    abort.current?.abort();
    setMessages([]);
    setBusy(false);
  };

  return { messages, busy, send, reset, setInquiryState };
};
