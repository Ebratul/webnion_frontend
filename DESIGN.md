# Webnion Design System

The source of truth for how the Webnion website looks. Read this before changing or adding UI.

## Direction

Clean, simple and premium, with generous whitespace and real work on show. The brand colour is the purple of the logo, `#8224E3`.
Section backgrounds follow the client's reference images, and the site opens in dark mode. Fonts stay Poppins and Hind Siliguri.

## Size and alignment

- The public site shows at 110% from 768px up, through `zoom` on `.site-zoom`. Phones stay at 100%. Admin is not zoomed.
- Viewport units are multiplied by the zoom, so anything sized from the screen divides by it: `calc(100svh / var(--page-zoom))`.
- Header, cards and banners share the `container-page` edges. A box with a border or background goes inside `container-page`, never on it, because its padding would push the box past those edges.
- **One vertical rhythm:** `--section-space` (72px on phones and tablets, 96px from 1024px up) is the only space between sections, on every page. Use `section-y`, or `section-b` when the section above has the same background. `flush-light` and `flush-dark` drop the top space when backgrounds match in only one theme.
- **One gap:** cards side by side use `gap-5` (20px). A section heading sits `mt-12` above its content.

## Homepage hero

Follows the client's reference: charcoal `#1E1E1E` with a faint warm glow in two corners in dark mode, and a cream gradient from
`#FFF3E9` in light mode. One primary button and a two-line subtitle. The header sits on the hero's background until the page scrolls.

## Light mode section colours

Sampled from the client's references. Buttons and accents are brand purple in every section. Pricing uses the white and grey of the client's image in both themes.

| Section | Background |
| --- | --- |
| Hero | Cream gradient from `#FFF3E9` |
| Client Trust | Project mosaic on black, logos on white in flat grey |
| Customer Problems | Sky to pink |
| Services, Delivery Stories, Process, Pricing | White |
| Business Outcomes | Beige `#F7EEE8` rounded card on white |
| Featured Projects | Title on white, cards on navy `#131620` |
| Testimonials | Title on white, reviews on lavender `#F7F7FE` |
| FAQs | Grey `#F6F6F6` with a peach glow |
| Final Inquiry and footer | Cream `#FAF2E6` |

Client logos in the Client Trust row are drawn in one colour, so they need a transparent background.

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
| `primary` | `#8224E3` | `#8224E3` | Button backgrounds and card borders (white text only) |
| `primary-hover` | `#6C1BC2` | `#6C1BC2` | Button hover |
| `accent` | `#B78CF5` | `#6C1BC2` | Coloured text and icons |
| `tint` | purple 16% | purple 8% | Chips and selected states |

- Never use `primary` as text on dark surfaces: use `accent`, which keeps its contrast in both themes.
- Green `#25D366` is for WhatsApp only. Amber is for review stars only.
- `.band-dark` keeps a section dark in both themes by pinning the dark tokens (Featured Projects, project mosaic, Technologies).

## Type

- English: Poppins. Bangla: Hind Siliguri, matched to the client's reference. Poppins comes first in the stack on both languages, so Latin words on Bangla pages stay in Poppins and Bengali letters fall through to Hind Siliguri. Weights 400 to 700.
- Bangla gets zero letter-spacing and taller line-height, because negative tracking breaks conjuncts.
  Never add `tracking-*` to text that can be Bangla without scoping it to `[&:lang(en)]`.
- Section headings: weight 500 at 44px on desktop. Delivery Stories alone uses semibold uppercase as a deliberate change of pace.

## Shape and depth

- Radius: 12 to 16px for tiles, 24px for cards, 32px for large panels, full for pills and icon buttons.
- Separate with hairlines and tone first. `shadow-soft` is reserved for floating or highlighted items.

## Components

- **Buttons:** every button has a `primary` background with white text, including icon buttons and header controls. Exceptions: the green WhatsApp button, and controls that show a state (carousel dots, the pages you are not on in pagination, assistant choices), where only the selected one is solid.
- **Primary button:** pill with the black arrow circle. Use one per view.
- **Content cards:** project, case study, product, team and technology cards have a 1px `primary` border. Service cards have no border at rest and a light `primary/40` one on hover.
- **Client logos:** full-colour logos on white tiles, in a row that moves right to left.
- **Project mosaic:** no border and no movement on hover, only the name appearing over the image.
- **Image cards:** project, review and delivery cards share one look, taken from the client's reference: a large image, 24px corners, and text on a dark gradient at the bottom. Review cards have a glass play button that turns brand purple on hover.
- **Project carousel:** three equal cards on desktop, two on tablet, one on phones. One card every 2 seconds, right to left. A counter, a thin progress line and the controls sit under it, not dots.
- **Outcome cards:** admin-managed cards above Customer Reviews. From 1024px they stick under the header and pile up, each stopping 56px lower so its small label stays visible, while the one beneath settles back a little. The step shrinks on short screens so the top card always fits. On smaller screens they are ordinary cards with a scroll reveal, because a stuck card taller than the screen could not be read.
- **Delivery Stories:** four numbered photo cards with the text over the image. As the page scrolls a line draws across them, the cards rise one after another and each photo drifts inside its card. Scroll-driven photos need `overflow-clip` on the card, because `overflow-hidden` would become their timeline.
- **Eyebrow chip:** tinted pill with a dot, above section headings.
- **Pricing plans:** white cards with 16px corners and the standard `gap-5`, all with the same rows, which line up across the cards. The highlighted plan adds an icon and badge above those rows, with a 2px `primary` border and a brand glow outside it.
- **Pricing buttons:** `plan-btn` lifts the button, passes a light across it and slides in an arrow on hover and keyboard focus.
- **Fan of client sites:** solid screens that run straight into the footer, with no fade. On hover a screen straightens, lifts and catches a passing light, and the others dim. The screen moves inside a still card, so the pointer cannot slip off a moving edge.
- **Footer:** flat background with no gradients, faint name behind the content, short lines under headings and links, and contact details in cards.
- **Chat demo:** one card with a header, a scrolling conversation (it hands the wheel back to the page at its ends), suggestions that step aside after the first question, and a one-line composer. Answers are scripted in the dictionaries and nothing leaves the browser, apart from the browser's own speech service if a visitor uses the mic.

## Motion

- Scroll reveals use CSS view timelines; unsupported browsers just show content.
- Animate `transform` and `opacity` only. Always name transition properties; never use `transition: all`.
- Everything respects `prefers-reduced-motion`. Moving content has a pause control.

## Content rules

- All copy lives in `src/i18n/en.ts` and `bn.ts`, or in the database as `{ en, bn }`. No hardcoded strings in components.
- Use real client names and work. Never invent testimonials, metrics or logos.
- English headings and buttons use Title Case. Format numbers and prices with `Intl` through `src/lib/format.ts`.
