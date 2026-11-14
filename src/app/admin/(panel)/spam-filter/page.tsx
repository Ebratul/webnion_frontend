import type { Metadata } from 'next';
import Link from 'next/link';
import { SpamFilterForm } from '@/components/admin/SpamFilterForm';
import { PageHeader } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin/session';
import type { SpamFilterData } from '@/lib/admin/spamFilter';

export const metadata: Metadata = { title: 'Spam Filter' };

export default async function SpamFilterPage() {
  const data = await adminFetch<SpamFilterData>('/inquiries/spam-filter');
  return (
    <>
      <PageHeader
        title="Spam Filter"
        description="Keeps junk out of Inquiries and your email. Real messages are saved here and emailed to the addresses under Contact & Links."
        actions={
          <Link href="/admin/inquiries" className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm font-medium transition-colors duration-200 hover:border-accent/60 hover:text-white">
            Inquiries
          </Link>
        }
      />
      <SpamFilterForm initial={data} />
    </>
  );
}
