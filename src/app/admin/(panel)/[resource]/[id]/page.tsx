import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ResourceForm } from '@/components/admin/ResourceForm';
import { getResource } from '@/lib/admin/resources';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

type PageProps = { params: Promise<{ resource: string; id: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const resource = getResource((await params).resource);
  return { title: resource ? `Edit ${resource.singular}` : undefined };
};

export default async function AdminEditPage({ params }: PageProps) {
  const { resource: key, id } = await params;
  const resource = getResource(key);
  if (!resource) notFound();
  if (resource.adminOnly && (await getAdminUser()).role !== 'ADMIN') notFound();

  // The API has no single-record admin route: its lists are small enough to read whole
  const rows = await adminFetch<(Record<string, unknown> & { id: string })[]>(resource.listPath);
  const row = rows.find((item) => item.id === id);
  if (!row) notFound();

  return (
    <>
      <header className="mb-8">
        <Link href={`/admin/${resource.key}`} className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors duration-200 hover:text-fg">
          <ArrowLeft aria-hidden className="size-3.5" />
          {resource.label}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{resource.rowTitle(row)}</h1>
      </header>
      <ResourceForm key={row.id} resourceKey={resource.key} row={row} />
    </>
  );
}
