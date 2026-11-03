import type { ReactNode } from 'react';

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="inline-flex items-center gap-2 rounded-full border border-line bg-tint px-3.5 py-1 text-xs font-medium text-accent">
    <span aria-hidden className="size-1.5 rounded-full bg-primary" />
    {children}
  </p>
);

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  id?: string;
}

export const SectionHeading = ({ eyebrow, title, subtitle, id }: SectionHeadingProps) => (
  <div className="reveal mx-auto max-w-3xl text-center">
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 id={id} className="mt-5 text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
      {title}
    </h2>
    {subtitle && <p className="mx-auto mt-4 max-w-2xl text-muted">{subtitle}</p>}
  </div>
);
