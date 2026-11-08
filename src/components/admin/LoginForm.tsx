'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { inputClass, labelClass } from './fields';
import { primaryButton } from './ui';

export const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
      });
      if (response.ok) {
        router.push('/admin');
        router.refresh();
        return;
      }
      const body: { message?: string; errors?: unknown[] } = await response.json();
      setError(body.errors ? 'Enter a valid email and password.' : (body.message ?? 'Could not log in.'));
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className={`${labelClass} mb-1.5`}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" spellCheck={false} className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className={`${labelClass} mb-1.5`}>Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </div>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className={`${primaryButton} w-full`}
      >
        {busy ? 'Logging In…' : 'Log In'}
      </button>
    </form>
  );
};
