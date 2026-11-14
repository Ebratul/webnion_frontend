'use client';

import { ShieldBan } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

// Blocks an inquiry's sender and deletes every message from them. Asks first, in place.
export const BlockSenderButton = ({ id, email, compact = false, onError, after }: { id: string; email: string; compact?: boolean; onError?: (message: string) => void; after?: string }) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState('');

  const block = () =>
    startTransition(async () => {
      setError('');
      const response = await fetch(`/api/admin/inquiries/${id}/block`, { method: 'POST' });
      if (!response.ok) {
        const result: { message?: string } = await response.json().catch(() => ({}));
        const message = result.message ?? 'Could not block this sender. Please try again.';
        setError(message);
        onError?.(message);
        setConfirming(false);
        return;
      }
      if (after) router.push(after);
      router.refresh();
    });

  if (confirming) {
    return (
      <div className="flex shrink-0 items-center gap-2 text-xs">
        <span className={compact ? 'hidden text-muted sm:inline' : 'text-muted'}>Block {email} and delete their messages?</span>
        <button type="button" disabled={busy} onClick={block} className="min-h-9 rounded-full bg-red-500 px-4 font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-60">
          {busy ? 'Blocking…' : 'Block'}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="min-h-9 rounded-full border border-line px-4 transition-colors duration-200 hover:border-accent">
          Cancel
        </button>
      </div>
    );
  }

  return compact ? (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Block ${email}`}
      title="Block sender"
      className="grid size-10 place-items-center rounded-xl text-muted transition-colors duration-200 hover:bg-white/[0.06] hover:text-red-400"
    >
      <ShieldBan aria-hidden className="size-4" />
    </button>
  ) : (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium transition-colors duration-200 hover:border-red-400/60 hover:text-red-300"
      >
        <ShieldBan aria-hidden className="size-4" />
        Block Sender
      </button>
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
