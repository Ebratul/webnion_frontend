import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { fontClasses } from '@/lib/fonts';
import '../globals.css';
import { BrandStyle } from '@/components/layout/BrandStyle';
import { getBrandOrDefault } from '@/lib/siteSettings';

export const metadata: Metadata = {
  title: { default: 'Webnion Admin', template: '%s | Webnion Admin' },
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const brand = await getBrandOrDefault();

  return (
    <html lang="en" data-theme="dark" className={fontClasses} style={{ scrollBehavior: 'auto' }}>
      <body>
        <BrandStyle primaryColor={brand.primaryColor} />
        {children}
      </body>
    </html>
  );
}
