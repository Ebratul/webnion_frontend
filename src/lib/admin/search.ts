// The admin search (Ctrl K): what the server sends and how results are matched and ranked

export interface SearchRecord {
  resource: string;
  title: string;
  subtitle: string;
  href: string;
  image: string | null;
}

export interface SearchText {
  path: string;
  en: string;
  bn: string;
}

export interface SearchIndex {
  records: SearchRecord[];
  texts: SearchText[];
  // Lists that could not be loaded, so the search can say some records are missing
  failed: number;
}

export const searchTerms = (query: string) => query.trim().toLowerCase().split(/\s+/).filter(Boolean);

const WORD_START = /[\s\-&/(·,.:_|]/;

// How well one term fits a piece of text: 3 at its start, 2 at a word's start, 1 anywhere, 0 not at all
const fit = (text: string, term: string) => {
  let at = text.indexOf(term);
  if (at === 0) return 3;
  let best = 0;
  while (at > 0) {
    if (WORD_START.test(text[at - 1]!)) return 2;
    best = 1;
    at = text.indexOf(term, at + 1);
  }
  return best;
};

// Every term has to appear somewhere. Hits in the title count most, then the subtitle, then the extra words.
export const scoreMatch = (terms: string[], title: string, subtitle = '', keywords = '') => {
  if (terms.length === 0) return 0;
  const [main, second, extra] = [title.toLowerCase(), subtitle.toLowerCase(), keywords.toLowerCase()];
  let score = 0;
  for (const term of terms) {
    const inTitle = fit(main, term);
    if (inTitle) {
      score += 10 + inTitle * 4;
      continue;
    }
    const elsewhere = Math.max(fit(second, term) * 2, fit(extra, term));
    if (!elsewhere) return 0;
    score += elsewhere;
  }
  // A whole-title match beats a longer title that only starts the same way
  if (main === terms.join(' ')) score += 20;
  return score;
};

// Splits text into plain and matching pieces, so the matching words can be marked
export const highlight = (text: string, terms: string[]) => {
  const lower = text.toLowerCase();
  const marks = new Array<boolean>(text.length).fill(false);
  for (const term of terms) {
    let at = lower.indexOf(term);
    while (at >= 0) {
      marks.fill(true, at, at + term.length);
      at = lower.indexOf(term, at + term.length);
    }
  }
  const pieces: { text: string; match: boolean }[] = [];
  for (let index = 0; index < text.length; index += 1) {
    const match = marks[index]!;
    const last = pieces[pieces.length - 1];
    if (last && last.match === match) last.text += text[index];
    else pieces.push({ text: text[index]!, match });
  }
  return pieces;
};
