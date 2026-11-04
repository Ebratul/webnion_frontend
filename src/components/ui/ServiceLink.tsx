'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { SECTION_IDS } from '@/lib/site';
import { openInquiryDialog } from '../sections/InquiryDialog';

interface ServiceLinkProps {
  slug: string;
  className?: string;
  children: ReactNode;
}

// Opens the inquiry form with this service preselected, without leaving the current section.
export const ServiceLink = ({ slug, className, children }: ServiceLinkProps) => (
  <Link
    href={{ query: { service: slug }, hash: SECTION_IDS.contact }}
    scroll={false}
    className={className}
    onClick={(event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      openInquiryDialog();
    }}
  >
    {children}
  </Link>
);
