import Link from 'next/link';
import type { ReactNode } from 'react';

// The assistant writes simple Markdown. It is turned into React elements here, never into HTML, so nothing it writes can
// run as code. Links are kept only when they lead to this site or to an https address.
const safeHref = (href: string) => {
  const value = href.trim();
  if (/^\/(?!\/)/.test(value) || value.startsWith('#')) return { href: value, external: false };
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return { href: url.toString(), external: true };
    if (url.protocol === 'mailto:' || url.protocol === 'tel:') return { href: value, external: false };
  } catch {
    // Not a valid address: shown as plain text
  }
  return null;
};

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]{1,200}\]\([^)\s]{1,500}\))/g;

const inline = (text: string, keyPrefix: string): ReactNode[] =>
  text.split(INLINE).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={key} className="font-semibold">{part.slice(2, -2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const target = safeHref(link[2]!);
      if (!target) return link[1];
      const className = 'font-medium text-primary underline underline-offset-2 dark:text-accent';
      return target.external ? (
        <a key={key} href={target.href} target="_blank" rel="noopener noreferrer nofollow" className={className}>{link[1]}</a>
      ) : (
        <Link key={key} href={target.href} className={className}>{link[1]}</Link>
      );
    }
    return part;
  });

export const ChatMarkdown = ({ text }: { text: string }) => {
  const blocks = text.replace(/\r/g, '').split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, index) => {
        const lines = block.split('\n').filter((line) => line.trim());
        if (lines.length === 0) return null;
        const isList = lines.every((line) => /^\s*([-*•]|\d{1,2}[.)])\s+/.test(line));
        if (isList) {
          return (
            <ul key={index} className="my-1.5 list-disc space-y-1 pl-5 marker:text-accent">
              {lines.map((line, lineIndex) => <li key={lineIndex}>{inline(line.replace(/^\s*([-*•]|\d{1,2}[.)])\s+/, ''), `${index}-${lineIndex}`)}</li>)}
            </ul>
          );
        }
        return (
          <p key={index} className="my-1.5 first:mt-0 last:mb-0">
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {inline(line.replace(/^#{1,6}\s+/, ''), `${index}-${lineIndex}`)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
};
