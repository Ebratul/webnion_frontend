import type { ReactNode } from 'react';
import { LineReveal } from './LineReveal';
import { LineText } from './LineText';

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
  <LineReveal className="mx-auto max-w-3xl text-center">
    {eyebrow && (
      <div data-line-item>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
    )}
    <h2 id={id} className="text-3xl font-medium sm:text-4xl lg:text-[2.75rem] [&:not(:first-child)]:mt-5">
      <LineText text={title} />
    </h2>
    {subtitle && (
      <p className="mx-auto mt-4 max-w-2xl text-muted">
        <LineText text={subtitle} />
      </p>
    )}
  </LineReveal>
);
