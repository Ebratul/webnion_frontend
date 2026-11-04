# Webnion Design System

The source of truth for how the Webnion website looks. Read this before changing or adding UI.

## Direction

Clean, simple and premium. Black space, one confident violet, generous whitespace and real work on show. Reference
screenshots supply layout only: colour and type always stay Webnion's.

## Colour

Tokens live in `src/app/globals.css` as CSS variables and are exposed to Tailwind (`bg-surface`, `text-muted`, and so on).

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `bg` | `#050507` | `#FFFFFF` | Page |
| `surface` | `#0E0E13` | `#F7F6FB` | Cards, alternate sections |
| `surface-2` | `#16161D` | `#EFEDF8` | Chips, image backdrops |
| `fg` | `#F6F6F9` | `#0E0E14` | Text |
| `muted` | `#A3A3B2` | `#5A5A6C` | Secondary text |
| `line` | white 10% | ink 10% | Hairlines |
| `primary` | `#7C3AED` | `#7C3AED` | Primary actions (white text only) |
| `accent` | `#A78BFA` | `#6D28D9` | Violet text and icons |
| `tint` | violet 14% | violet 8% | Chips and selected states |

- Never use `primary` as text on dark surfaces: use `accent`, which keeps its contrast in both themes.
- Green `#25D366` is for WhatsApp only. Amber is for review stars only.
- `.band-dark` keeps a section dark in both themes by pinning the dark tokens (Featured Projects, project mosaic, Technologies).

## Type

- English: Poppins. Bangla: Hind Siliguri. Selected through `:lang()` in `globals.css`; weights 400 to 700.
- Bangla gets zero letter-spacing and taller line-height, because negative tracking breaks conjuncts.
  Never add `tracking-*` to text that can be Bangla without scoping it to `[&:lang(en)]`.
- Headings: weight 600. Delivery Stories alone uses bold uppercase as a deliberate change of pace.

## Shape and depth

- Radius: 12 to 16px for tiles, 24px for cards, 32px for large panels, full for pills and icon buttons.
- Separate with hairlines and tone first. `shadow-soft` is reserved for floating or highlighted items.

## Components

- **Primary button:** violet pill with the black arrow circle, Webnion's signature. Use one per view.
- **Secondary button:** outlined pill.
- **Eyebrow chip:** tinted pill with a dot, above section headings.
- **Highlighted pricing plan:** violet border, raised, icon and badge, inner panel, gradient button.

## Motion

- Scroll reveals use CSS view timelines; unsupported browsers just show content.
- Animate `transform` and `opacity` only. Always name transition properties; never use `transition: all`.
- Everything respects `prefers-reduced-motion`. Moving content has a pause control.

## Content rules

- All copy lives in `src/i18n/en.ts` and `bn.ts`, or in the database as `{ en, bn }`. No hardcoded strings in components.
- Use real client names and work. Never invent testimonials, metrics or logos.
- English headings and buttons use Title Case. Format numbers and prices with `Intl` through `src/lib/format.ts`.
