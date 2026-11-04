import type { Metadata } from 'next';
import Image from 'next/image';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = { title: 'Log In' };

export default function AdminLoginPage() {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden px-5 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_50%_90%_at_50%_-10%,rgb(124_58_237/0.25),transparent_70%)]" />
      <div className="relative w-full max-w-sm">
        <Image src="/images/brand/logo-white.png" alt="Webnion" width={229} height={42} priority className="mx-auto h-6 w-auto" />
        <div className="mt-8 rounded-3xl border border-line bg-surface p-7">
          <h1 className="text-xl font-semibold">Welcome Back</h1>
          <p className="mb-6 mt-1 text-sm text-muted">Log in to manage your website.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
