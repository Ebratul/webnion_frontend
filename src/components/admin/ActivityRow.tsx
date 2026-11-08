import { CircleCheck, FilePlus2, History, ImageUp, Inbox, LogIn, LogOut, ListOrdered, PencilLine, ShieldAlert, Trash2, type LucideIcon } from 'lucide-react';

export interface ActivityEntry {
  id: string;
  action: string;
  resource: string | null;
  summary: string;
  details: string | null;
  actorName: string | null;
  actorEmail: string | null;
  ip: string | null;
  createdAt: string;
}

const STYLES: Record<string, { Icon: LucideIcon; tone: string }> = {
  LOGIN: { Icon: LogIn, tone: 'bg-emerald-400/10 text-emerald-300' },
  LOGOUT: { Icon: LogOut, tone: 'bg-white/[0.06] text-muted' },
  LOGIN_FAILED: { Icon: ShieldAlert, tone: 'bg-red-400/10 text-red-300' },
  CREATE: { Icon: FilePlus2, tone: 'bg-tint text-accent' },
  UPDATE: { Icon: PencilLine, tone: 'bg-sky-400/10 text-sky-300' },
  DELETE: { Icon: Trash2, tone: 'bg-red-400/10 text-red-300' },
  REORDER: { Icon: ListOrdered, tone: 'bg-white/[0.06] text-muted' },
  UPLOAD: { Icon: ImageUp, tone: 'bg-amber-400/10 text-amber-300' },
  INQUIRY: { Icon: Inbox, tone: 'bg-emerald-400/10 text-emerald-300' },
};

// Everyone on the team reads these times in Bangladesh time, wherever the server runs
const timeFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

export const formatWhen = (date: string) => timeFormat.format(new Date(date));

export const ActivityRow = ({ entry }: { entry: ActivityEntry }) => {
  const { Icon, tone } = STYLES[entry.action] ?? { Icon: entry.action ? CircleCheck : History, tone: 'bg-white/[0.06] text-muted' };
  const who = entry.actorName ?? entry.actorEmail ?? 'Unknown';
  const meta = [who, entry.ip, entry.details].filter(Boolean).join(' · ');

  return (
    <li className="flex items-start gap-4 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.025]">
      <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium [overflow-wrap:anywhere]">{entry.summary}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted [overflow-wrap:anywhere]">{meta}</p>
        <time dateTime={entry.createdAt} className="mt-1 block text-xs text-muted sm:hidden">{formatWhen(entry.createdAt)}</time>
      </div>
      <time dateTime={entry.createdAt} className="hidden shrink-0 pt-0.5 text-xs tabular-nums text-muted sm:block">{formatWhen(entry.createdAt)}</time>
    </li>
  );
};
