import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ResourceForm } from '@/components/admin/ResourceForm';
import { getResource } from '@/lib/admin/resources';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

type PageProps = { params: Promise<{ resource: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const resource = getResource((await params).resource);
  return { title: resource ? `New ${resource.singular}` : undefined };
};

export default async function AdminNewPage({ params }: PageProps) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource?.canCreate) notFound();
  if (resource.adminOnly && (await getAdminUser()).role !== 'ADMIN') notFound();

  // A new record goes to the end of the list and can be moved from there
  const rows = resource.sortable ? await adminFetch<{ sortOrder: number }[]>(resource.listPath) : [];
  const nextSortOrder = rows.reduce((highest, row) => Math.max(highest, row.sortOrder + 1), 0);

  return (
    <>
      <header className="mb-8">
        <Link href={`/admin/${resource.key}`} className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors duration-200 hover:text-fg">
          <ArrowLeft aria-hidden className="size-3.5" />
          {resource.label}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">New {resource.singular}</h1>
      </header>
      <ResourceForm resourceKey={resource.key} nextSortOrder={nextSortOrder} />
    </>
  );
}
