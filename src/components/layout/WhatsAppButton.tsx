import { CONTACT } from '@/lib/site';
import { WhatsAppIcon } from '../ui/BrandIcons';

export const WhatsAppButton = ({ label }: { label: string }) => (
  <aside aria-label={label}>
    <a
      href={CONTACT.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 grid size-14 place-items-center rounded-full border border-white/10 bg-ink/90 shadow-soft transition-transform duration-200 hover:scale-105"
    >
      <span className="grid size-10 place-items-center rounded-full bg-whatsapp text-white">
        <WhatsAppIcon className="size-5" />
      </span>
    </a>
  </aside>
);
