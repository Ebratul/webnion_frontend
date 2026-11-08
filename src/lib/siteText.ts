// Lets an admin replace any built-in sentence. Text is addressed by its path in the dictionary, such as
// hero.titleLines.0, so only what was actually changed is stored and new text in the code still appears.

export type TextValue = string | number;
export type FlatText = Record<string, TextValue>;
export type TextOverrides = Record<string, string>;

// Screen reader labels and the language switch are not content. Slugs are links, and logos are file names.
const HIDDEN_GROUPS = new Set(['a11y']);
const HIDDEN_KEYS = new Set(['slug', 'logo', 'switchLanguage', 'switchLanguageLabel']);

export const flattenText = (source: unknown): FlatText => {
  const flat: FlatText = {};
  const walk = (value: unknown, path: string) => {
    if (typeof value === 'string' || typeof value === 'number') flat[path] = value;
    else if (Array.isArray(value)) value.forEach((item, index) => walk(item, `${path}.${index}`));
    else if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (!HIDDEN_KEYS.has(key) && !(path === '' && HIDDEN_GROUPS.has(key))) walk(item, path ? `${path}.${key}` : key);
      }
    }
  };
  walk(source, '');
  return flat;
};

// A saved path that no longer exists, or that holds a different kind of value, is ignored rather than breaking the page
export const applyTextOverrides = <T extends object>(dictionary: T, overrides: TextOverrides | undefined): T => {
  if (!overrides || Object.keys(overrides).length === 0) return dictionary;
  const copy = structuredClone(dictionary);
  for (const [path, value] of Object.entries(overrides)) {
    const keys = path.split('.');
    const last = keys.pop()!;
    let parent: unknown = copy;
    for (const key of keys) {
      if (!parent || typeof parent !== 'object' || !Object.hasOwn(parent, key)) {
        parent = undefined;
        break;
      }
      parent = (parent as Record<string, unknown>)[key];
    }
    if (!parent || typeof parent !== 'object' || !Object.hasOwn(parent, last)) continue;
    const holder = parent as Record<string, unknown>;
    if (typeof holder[last] === 'string') holder[last] = value;
    else if (typeof holder[last] === 'number' && Number.isFinite(Number(value))) holder[last] = Number(value);
  }
  return copy;
};
