// The contact form's spam rules, edited under Leads → Spam Filter. Saved by the API, never shown on the public site.
export interface SpamFilter {
  // Full addresses (name@example.com) or whole domains (example.com)
  blockedEmails: string[];
  blockedWords: string[];
  maxLinks: number;
  // 0 turns the wait off
  cooldownMinutes: number;
  blockDisposable: boolean;
  blockDuplicates: boolean;
}

export interface BlockedMessage {
  email: string;
  reason: string;
  at: string;
}

export interface SpamFilterData {
  filter: SpamFilter;
  blocked: BlockedMessage[];
}

// "@Example.com" and "example.com" mean the same domain
export const normalizeBlockEntry = (entry: string) => entry.trim().toLowerCase().replace(/^@/, '');

export const isValidBlockEntry = (entry: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry) || /^(?=.{3,200}$)([a-z0-9-]+\.)+[a-z]{2,}$/.test(entry);

// Whether an address is covered by the list, by itself or by its domain
export const isBlocked = (email: string, list: string[]) => {
  const address = normalizeBlockEntry(email);
  const domain = address.slice(address.lastIndexOf('@') + 1);
  return list.some((entry) => {
    const value = normalizeBlockEntry(entry);
    return value.includes('@') ? value === address : domain === value || domain.endsWith(`.${value}`);
  });
};
