import { LockKeyhole } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = { title: 'Log In' };

export default function AdminLoginPage() {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden px-5 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(55%_90%_at_50%_-10%,rgb(130_36_227/0.32),transparent)]" />
      <div className="relative w-full max-w-md">
        <Image src="/images/brand/logo-white.png" alt="Webnion" width={229} height={42} priority className="mx-auto h-7 w-auto" />
        <div className="mt-8 rounded-3xl border border-line bg-surface p-7 shadow-[0_40px_80px_-40px_rgb(130_36_227/0.5)] sm:p-9">
          <span aria-hidden className="grid size-11 place-items-center rounded-xl bg-tint text-accent"><LockKeyhole className="size-5" /></span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Welcome Back</h1>
          <p className="mb-7 mt-1.5 text-sm text-muted">Log in to manage your website.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
