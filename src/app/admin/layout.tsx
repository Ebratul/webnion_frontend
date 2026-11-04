import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { fontClasses } from '@/lib/fonts';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: 'Webnion Admin', template: '%s | Webnion Admin' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={fontClasses} style={{ scrollBehavior: 'auto' }}>
      <body>{children}</body>
    </html>
  );
}
