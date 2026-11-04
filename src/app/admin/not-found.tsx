import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-5 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Page Not Found</h1>
        <p className="mt-2 text-sm text-muted">This page does not exist, or you do not have access to it.</p>
        <Link href="/admin" className="mt-6 inline-block text-sm font-medium text-accent">Back To Dashboard</Link>
      </div>
    </main>
  );
}
