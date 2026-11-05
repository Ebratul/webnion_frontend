'use client';

import { ArrowRight, ArrowUp, Mic, Plus } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';

type Copy = Dictionary['problems'];
type Topic = keyof Copy['replies'];
type QuickTopic = keyof Copy['questions'];
type Action = 'contact' | 'pricing';

interface Message {
  id: number;
  from: 'visitor' | 'webnion';
  text: string;
  action?: Action;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechWindow = Window & { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };

const REPLY_DELAY = 800;
const MAX_LENGTH = 300;

// First match wins, so narrower topics come first. Bangla words have no \b because it only understands Latin letters.
const TOPIC_PATTERNS = (
  [
    ['contact', String.raw`\b(contact|call|meeting|talk|whatsapp|phone|email)\b|যোগাযোগ|মিটিং|ফোন|ফ্রি কল`],
    ['price', String.raw`\b(price|prices|pricing|cost|costs|budget|fee|fees|package|packages|plan|plans)\b|দাম|খরচ|মূল্য|প্যাকেজ|প্ল্যান|বাজেট|টাকা`],
    ['time', String.raw`\b(how long|timeline|time|duration|deadline)\b|কত সময়|সময়|কত দিন`],
    ['tracking', String.raw`\b(track\w*|analytics|marketing|campaigns?|ads?|pixel)\b|ট্র্যাক|মার্কেটিং|ক্যাম্পেইন|বিজ্ঞাপন`],
    ['automation', String.raw`\b(automat\w*|workflows?|manual\w*|booking|crm)\b|অটোমেশন|অটোমেট|বুকিং`],
    ['support', String.raw`\b(ai|chatbots?|bots?|leads?|support|repl(y|ies)|customers?)\b|চ্যাটবট|লিড|সাপোর্ট|কাস্টমার|গ্রাহক`],
    ['website', String.raw`\b(website|websites|web|site|landing|design|redesign|seo|e-?commerce|store|shop|services?)\b|ওয়েব|সাইট|ডিজাইন|কমার্স|সার্ভিস`],
    ['greeting', String.raw`\b(hi|hello|hey|salam|assalamu?)\b|হ্যালো|সালাম|নমস্কার|হাই`],
  ] as const
).map(([topic, pattern]) => [topic, new RegExp(pattern.normalize('NFC'), 'i')] as const);

const ACTIONS: Partial<Record<Topic, Action>> = { price: 'pricing', time: 'contact', contact: 'contact', fallback: 'contact' };

const QUICK_TOPICS: QuickTopic[] = ['price', 'time', 'automation', 'tracking'];

const findTopic = (text: string): Topic => TOPIC_PATTERNS.find(([, pattern]) => pattern.test(text.normalize('NFC')))?.[0] ?? 'fallback';

const Bubble = ({ from, label, children }: { from: Message['from']; label: string; children: ReactNode }) =>
  from === 'visitor' ? (
    <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[0.8125rem] leading-relaxed text-white">
      <span className="sr-only">{label}: </span>
      {children}
    </div>
  ) : (
    <div className="flex max-w-[92%] items-start gap-2.5">
      <span aria-hidden className="chat-orb size-8 shrink-0 rounded-full" />
      <div className="min-w-0 rounded-2xl rounded-tl-md bg-surface-2 px-4 py-2.5 text-[0.8125rem] leading-relaxed">
        <span className="sr-only">{label}: </span>
        {children}
      </div>
    </div>
  );

export const ChatDemo = ({ t }: { t: Copy }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [replying, setReplying] = useState(false);
  const [listening, setListening] = useState(false);

  const nextId = useRef(0);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      clearTimeout(replyTimer.current);
      recognition.current?.stop();
    },
    [],
  );

  // Scrolls only the conversation. Scrolling a message into view would also move the page.
  useEffect(() => {
    if (log.current) log.current.scrollTop = messages.length > 0 ? log.current.scrollHeight : 0;
  }, [messages, replying]);

  const reset = () => {
    clearTimeout(replyTimer.current);
    setMessages([]);
    setReplying(false);
    setDraft('');
  };

  const send = (text: string, knownTopic?: Topic) => {
    const clean = text.trim();
    if (!clean || replying) return;

    const topic = knownTopic ?? findTopic(clean);
    setMessages((current) => [...current, { id: nextId.current++, from: 'visitor', text: clean }]);
    setDraft('');
    setReplying(true);

    replyTimer.current = setTimeout(() => {
      setMessages((current) => [...current, { id: nextId.current++, from: 'webnion', text: t.replies[topic], action: ACTIONS[topic] }]);
      setReplying(false);
    }, REPLY_DELAY);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    send(draft);
  };

  const toggleVoice = () => {
    if (listening) {
      recognition.current?.stop();
      return;
    }

    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      input.current?.focus();
      return;
    }

    const session = new Recognition();
    session.lang = t.speechLang;
    session.interimResults = false;
    session.onresult = (event) => setDraft(event.results[0]?.[0]?.transcript.slice(0, MAX_LENGTH) ?? '');
    session.onerror = () => setListening(false);
    session.onend = () => {
      setListening(false);
      input.current?.focus();
    };
    recognition.current = session;
    setListening(true);
    session.start();
  };

  const iconButton = 'grid size-9 shrink-0 place-items-center rounded-full bg-primary text-white transition-colors duration-200 hover:bg-primary-hover';

  return (
    <div className="flex h-[38rem] min-w-0 flex-col rounded-3xl bg-bg p-4 shadow-soft sm:p-5">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <span aria-hidden className="chat-orb size-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{t.chatTitle}</p>
          <p className="mt-0.5 truncate text-xs leading-tight text-muted">{t.demoNote}</p>
        </div>
        <button type="button" aria-label={t.newChat} onClick={reset} className={iconButton}>
          <Plus aria-hidden className="size-4" />
        </button>
      </div>

      <div
        ref={log}
        role="log"
        tabIndex={0}
        aria-label={t.chatLabel}
        className="chat-fade min-h-0 flex-1 space-y-3 overflow-y-auto scroll-smooth py-4 pr-2 motion-reduce:scroll-auto"
      >
        {t.pairs.map((pair) => (
          <div key={pair.problem} className="space-y-3">
            <Bubble from="visitor" label={t.you}>{pair.problem}</Bubble>
            <Bubble from="webnion" label={t.webnion}>{pair.solution}</Bubble>
          </div>
        ))}

        {messages.map((message) => (
          <Bubble key={message.id} from={message.from} label={message.from === 'visitor' ? t.you : t.webnion}>
            {message.text}
            {message.action && (
              <a
                href={`#${message.action === 'pricing' ? SECTION_IDS.pricing : SECTION_IDS.contact}`}
                className="group mt-1.5 flex w-fit items-center gap-1 py-0.5 font-semibold text-accent"
              >
                {t.actions[message.action]}
                <ArrowRight aria-hidden className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            )}
          </Bubble>
        ))}

        {replying && (
          <Bubble from="webnion" label={t.typing}>
            <span aria-hidden className="flex h-5 items-center gap-1">
              <span className="chat-dot" />
              <span className="chat-dot" />
              <span className="chat-dot" />
            </span>
          </Bubble>
        )}
      </div>

      {/* Suggestions step aside once the visitor has asked something, which leaves more room for the answers */}
      {messages.length === 0 && (
        <ul aria-label={t.suggestions} className="no-scrollbar mb-3 flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible">
          {QUICK_TOPICS.map((topic) => (
            <li key={topic} className="shrink-0">
              <button
                type="button"
                onClick={() => send(t.questions[topic], topic)}
                className="min-h-8 rounded-full bg-primary px-3 py-1 text-left text-xs text-white transition-colors duration-200 hover:bg-primary-hover"
              >
                {t.questions[topic]}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 rounded-full border border-line py-1 pl-4 pr-1 transition-colors duration-200 focus-within:border-accent">
        <label htmlFor="chat-input" className="sr-only">{t.prompt}</label>
        <input
          id="chat-input"
          ref={input}
          value={draft}
          maxLength={MAX_LENGTH}
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
          placeholder={listening ? t.listening : t.prompt}
          className="min-h-9 min-w-0 flex-1 bg-transparent text-base text-ellipsis outline-none placeholder:text-sm placeholder:text-muted sm:text-sm"
        />
        <button type="button" aria-label={t.voice} aria-pressed={listening} onClick={toggleVoice} className={`${iconButton} ${listening ? 'chat-listening' : ''}`}>
          <Mic aria-hidden className="size-4" />
        </button>
        <button type="submit" aria-label={t.send} disabled={!draft.trim() || replying} className={`${iconButton} disabled:pointer-events-none disabled:opacity-40`}>
          <ArrowUp aria-hidden className="size-4" />
        </button>
      </form>
    </div>
  );
};
