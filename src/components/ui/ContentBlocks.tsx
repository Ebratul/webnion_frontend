import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import type { ContentBlock } from '@/lib/types';

// lang follows the language the text is really written in, so a page without a translation still gets the right font
export const ContentBlocks = ({ blocks, locale }: { blocks: ContentBlock[]; locale: Locale }) => (
  <div lang={locale}>
    {blocks.map((block, index) => {
      switch (block.type) {
        case 'heading':
          return <h2 key={index} className="mt-8 text-xl font-semibold first:mt-0">{block.text}</h2>;
        case 'paragraph':
          return <p key={index} className="mt-3 text-sm leading-relaxed text-muted sm:text-base sm:leading-relaxed">{block.text}</p>;
        case 'list':
          return (
            <ul key={index} className="mt-3 list-disc space-y-2 pl-5 text-sm marker:text-accent sm:text-base">
              {block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
            </ul>
          );
        case 'image':
          return <Image key={index} src={block.src} alt="" width={1050} height={600} sizes="(min-width: 1024px) 768px, 100vw" className="mt-6 h-auto w-full rounded-xl" />;
      }
    })}
  </div>
);
