'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { SECTION_IDS } from '@/lib/site';

interface ServiceLinkProps {
  slug: string;
  className?: string;
  children: ReactNode;
}

// Preselects a service in the inquiry form. Next.js does not scroll when only the query and hash
// change, so the scroll to the form is done here.
export const ServiceLink = ({ slug, className, children }: ServiceLinkProps) => (
  <Link
    href={{ query: { service: slug }, hash: SECTION_IDS.contact }}
    scroll={false}
    className={className}
    onClick={(event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      document.getElementById(SECTION_IDS.contact)?.scrollIntoView();
    }}
  >
    {children}
  </Link>
);
