import { Globe } from 'lucide-react';
import { siBehance, siDribbble, siFacebook, siGithub, siInstagram, siMessenger, siPinterest, siTelegram, siThreads, siTiktok, siWhatsapp, siX, siYoutube } from 'simple-icons';
import type { SocialNetwork } from '@/lib/navigation';

const PATHS: Partial<Record<SocialNetwork, string>> = {
  facebook: siFacebook.path, instagram: siInstagram.path, youtube: siYoutube.path, x: siX.path, tiktok: siTiktok.path, whatsapp: siWhatsapp.path,
  telegram: siTelegram.path, messenger: siMessenger.path, pinterest: siPinterest.path, threads: siThreads.path, github: siGithub.path, behance: siBehance.path, dribbble: siDribbble.path,
};

// Brand marks from Simple Icons. LinkedIn asked to be removed from that set, so it is drawn as its two letters.
export const SocialIcon = ({ network, className = 'size-4' }: { network: SocialNetwork; className?: string }) => {
  if (network === 'linkedin') {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}>
        <text x="12" y="17.5" textAnchor="middle" fontSize="16" fontWeight="700" fontFamily="Arial, sans-serif" fill="currentColor">in</text>
      </svg>
    );
  }
  const path = PATHS[network];
  if (!path) return <Globe aria-hidden className={className} />;
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={path} />
    </svg>
  );
};
