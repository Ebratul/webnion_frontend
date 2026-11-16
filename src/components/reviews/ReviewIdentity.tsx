import Image from 'next/image';
import type { Testimonial } from '@/lib/types';

// The client under a review: photo or logo, name, and company or role. Without a photo, the first letter stands in.
export const ReviewIdentity = ({ item, className = '' }: { item: Testimonial; className?: string }) => (
  <div className={`flex min-w-0 items-center gap-3 ${className}`}>
    {item.avatar ? (
      <Image src={item.avatar} alt="" width={44} height={44} sizes="44px" className="size-9 shrink-0 sm:size-11 rounded-full bg-white object-cover ring-1 ring-line" />
    ) : (
      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-sm sm:size-11 sm:text-base font-semibold text-accent ring-1 ring-line">
        {item.name.trim().charAt(0).toUpperCase()}
      </span>
    )}
    <div className="min-w-0">
      <p translate="no" className="line-clamp-2 text-sm font-semibold leading-snug [overflow-wrap:anywhere] sm:text-base">{item.name}</p>
      {item.role && <p className="truncate text-xs text-muted sm:text-sm">{item.role}</p>}
    </div>
  </div>
);
