'use client';

import { ArrowRight, ArrowUp, Mic, Plus, SlidersHorizontal, Sparkles, UserRound, Workflow } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';

type Copy = Dictionary['problems'];
type Assistant = keyof Copy['assistants'];
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

const ASSISTANTS: { id: Assistant; icon: typeof Sparkles; pairs: [number, number] }[] = [
  { id: 'website', icon: Sparkles, pairs: [0, 1] },
  { id: 'automation', icon: Workflow, pairs: [2, 3] },
];

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

const Bubble = ({ from, label, children }: { from: Message['from']; label: string; children: ReactNode }) => (
  <div className={`flex w-fit max-w-[92%] items-center sm:max-w-[82%] gap-2.5 rounded-2xl border border-line bg-bg py-2 pl-2 pr-4 text-[0.8125rem] leading-relaxed shadow-sm ${from === 'visitor' ? 'ml-auto' : 'mr-auto'}`}>
    {from === 'visitor' ? (
      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
        <UserRound className="size-4.5" />
      </span>
    ) : (
      <span aria-hidden className="chat-orb size-9 shrink-0 rounded-full" />
    )}
    <div className="min-w-0">
      <span className="sr-only">{label}: </span>
      {children}
    </div>
  </div>
);

export const ChatDemo = ({ t }: { t: Copy }) => {
  const [assistant, setAssistant] = useState<Assistant>('website');
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [replying, setReplying] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
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
  }, [messages, replying, assistant]);

  const reset = () => {
    clearTimeout(replyTimer.current);
    setMessages([]);
    setReplying(false);
    setToolsOpen(false);
    setDraft('');
  };

  const send = (text: string, knownTopic?: Topic) => {
    const clean = text.trim();
    if (!clean || replying) return;

    const topic = knownTopic ?? findTopic(clean);
    setMessages((current) => [...current, { id: nextId.current++, from: 'visitor', text: clean }]);
    setDraft('');
    setToolsOpen(false);
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

  const seed = ASSISTANTS.find(({ id }) => id === assistant)?.pairs.map((index) => t.pairs[index]) ?? [];

  return (
    <div className="relative min-w-0 xl:pt-16">
      <fieldset className="mb-4 min-w-0 rounded-2xl border border-line bg-bg p-3 shadow-soft xl:absolute xl:-left-28 xl:top-0 xl:z-10 xl:mb-0 xl:w-48">
        <legend className="float-left mb-2.5 w-full px-1 text-xs font-semibold">{t.panelTitle}</legend>
        <div className="clear-both grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          {ASSISTANTS.map(({ id, icon: Icon }) => {
            const selected = assistant === id;
            return (
              <label
                key={id}
                className={`block cursor-pointer rounded-xl border p-2 transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${selected ? 'border-transparent bg-[var(--tint)]' : 'border-line hover:border-accent'}`}
              >
                <input
                  type="radio"
                  name="chat-assistant"
                  className="sr-only"
                  checked={selected}
                  onChange={() => {
                    reset();
                    setAssistant(id);
                  }}
                />
                <span className="flex items-center gap-2">
                  <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-lg bg-bg shadow-sm ${selected ? 'text-accent' : 'text-muted'}`}>
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`flex items-center justify-between gap-1.5 text-[0.6875rem] font-medium leading-tight ${selected ? '' : 'text-muted'}`}>
                      {t.assistants[id]}
                      <span aria-hidden className={`flex h-3.5 w-6 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${selected ? 'justify-end bg-primary' : 'justify-start border border-line bg-bg'}`}>
                        <span className={`size-2.5 rounded-full ${selected ? 'bg-white' : 'bg-line'}`} />
                      </span>
                    </span>
                    <span aria-hidden className="mt-1.5 block h-1 w-4/5 rounded-full bg-line/70" />
                    <span aria-hidden className="mt-1 block h-1 w-3/5 rounded-full bg-line/50" />
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="rounded-3xl bg-bg p-4 shadow-soft sm:p-5">
        <div className="flex items-center gap-3 pb-1">
          <span aria-hidden className="size-7" />
          <p className="flex-1 text-center text-sm font-semibold">{t.chatTitle}</p>
          <span aria-hidden className="chat-orb size-7 rounded-full" />
        </div>

        <div
          ref={log}
          role="log"
          tabIndex={0}
          aria-label={t.chatLabel}
          className="chat-fade no-scrollbar h-[23.5rem] space-y-3 overflow-y-auto overscroll-contain scroll-smooth rounded-xl py-3 motion-reduce:scroll-auto sm:h-[21rem]"
        >
          {seed.map((pair) => (
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

        <form onSubmit={handleSubmit} className="mt-3 rounded-2xl border border-line p-3 transition-colors duration-200 focus-within:border-accent">
          <div className="flex items-center gap-2">
            <label htmlFor="chat-input" className="sr-only">{t.prompt}</label>
            <input
              id="chat-input"
              ref={input}
              value={draft}
              maxLength={MAX_LENGTH}
              autoComplete="off"
              onChange={(event) => setDraft(event.target.value)}
              placeholder={listening ? t.listening : t.prompt}
              className="min-h-10 min-w-0 flex-1 bg-transparent px-1 text-base outline-none lg:min-h-0 placeholder:text-muted sm:text-sm"
            />
            <button
              type="submit"
              aria-label={t.send}
              disabled={!draft.trim() || replying}
              className="grid size-8 shrink-0 place-items-center rounded-full text-fg transition-opacity duration-200 hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowUp aria-hidden className="size-4" />
            </button>
          </div>

          {toolsOpen && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {QUICK_TOPICS.map((topic) => (
                <li key={topic}>
                  <button
                    type="button"
                    onClick={() => send(t.questions[topic], topic)}
                    className="min-h-8 rounded-full border border-line px-3 py-1 text-left text-xs transition-colors duration-200 hover:border-accent hover:text-accent"
                  >
                    {t.questions[topic]}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              aria-label={t.newChat}
              onClick={reset}
              className="grid size-8 place-items-center rounded-full border border-line transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              <Plus aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen((open) => !open)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors duration-200 hover:border-accent hover:text-accent ${toolsOpen ? 'border-accent text-accent' : 'border-line'}`}
            >
              <SlidersHorizontal aria-hidden className="size-3.5" />
              {t.tools}
            </button>
            <button
              type="button"
              aria-label={t.voice}
              aria-pressed={listening}
              onClick={toggleVoice}
              className={`ml-auto grid size-8 place-items-center rounded-full bg-fg text-bg transition-transform duration-200 hover:-translate-y-0.5 ${listening ? 'chat-listening' : ''}`}
            >
              <Mic aria-hidden className="size-4" />
            </button>
          </div>
        </form>

        <p className="mt-2.5 text-center text-[0.6875rem] leading-snug text-muted">{t.demoNote}</p>
      </div>
    </div>
  );
};
