# Webnion Design System

The source of truth for how the Webnion website looks. Read this before changing or adding UI.

## Direction

Clean, simple and premium, with generous whitespace and real work on show. The brand colour is the purple of the logo, `#8224E3`.
Section backgrounds follow the client's reference images, and the site opens in dark mode. Fonts stay Poppins and Hind Siliguri.

## Size and alignment

- The public site shows at 110% from 768px up, through `zoom` on `.site-zoom`, on screens at least 512px tall. Phones stay at 100%, held sideways too. Admin is not zoomed.
- Viewport units are multiplied by the zoom, so anything sized from the screen divides by it: `calc(100svh / var(--page-zoom))`.
- Header, cards and banners share the `container-page` edges. A box with a border or background goes inside `container-page`, never on it, because its padding would push the box past those edges.
- **One vertical rhythm:** `--section-space` (72px on phones and tablets, 96px from 1024px up) is the only space between sections, on every page. Use `section-y`, or `section-b` when the section above has the same background. `flush-light` and `flush-dark` drop the top space when backgrounds match in only one theme.
- **One gap:** cards side by side use `gap-5` (20px). A section heading sits `mt-12` above its content.

## Header

Fixed to the top of the screen, with a spacer holding its place in the page. Keep it `fixed`, not `sticky`: the owner saw the sticky header slip up and get cut off while scrolling.

## Homepage hero

Follows the client's reference: charcoal `#1E1E1E` with a faint warm glow in two corners in dark mode, and a cream gradient from
`#FFF3E9` in light mode. One primary button and a two-line subtitle. The header sits on the hero's background until the page scrolls.

**By default the hero has no image**, only the gradient above: the owner wants it simple. Admins can upload a background under **Hero Background**; the first visible one is shown, under a veil in the theme's colour (`.hero-media::after`), thicker behind the heading and solid at the foot so the image fades into the page, drifting very slowly. Hiding or deleting every background brings the gradient back.

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
| Final Inquiry and footer | Cream `#FAF2E6`, with a dark lit panel in Final Inquiry |

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
- **The brand colour can change.** An admin picks one colour under Brand; `lib/brandColors.ts` derives `--primary-hover`, `--accent-dark` and `--accent-light` (stepped until they reach 4.5 contrast) and `BrandStyle` writes them on `:root`. Never write the purple as a literal: use `var(--primary)`, `var(--accent)`, `var(--accent-dark)` on always-dark cards, and `color-mix(in srgb, var(--primary) N%, transparent)` for tints and glows.
- Logos and the site name come from Brand too (`getBrand`), so components take them as props instead of hard-coding `/images/brand/…`.
- Green `#25D366` is for WhatsApp only. Amber is for review stars only.
- `.band-dark` keeps a section dark in both themes by pinning the dark tokens (Featured Projects, project mosaic, Technologies).

## Type

- English: Poppins. Bangla: Hind Siliguri, matched to the client's reference. Poppins comes first in the stack on both languages, so Latin words on Bangla pages stay in Poppins and Bengali letters fall through to Hind Siliguri. Bangla digits use Noto Sans Bengali (`public/fonts`), because Hind Siliguri's ১ reads as a cut-off character. Weights 400 to 700.
- Bangla gets zero letter-spacing and taller line-height, because negative tracking breaks conjuncts.
  Never add `tracking-*` to text that can be Bangla without scoping it to `[&:lang(en)]`.
- Section headings: weight 500 at 44px on desktop. Delivery Stories alone uses semibold uppercase as a deliberate change of pace.

## Shape and depth

- Radius: 12 to 16px for tiles, 24px for cards, 32px for large panels, full for pills and icon buttons.
- Separate with hairlines and tone first. `shadow-soft` is reserved for floating or highlighted items.

## Components

- **Buttons:** every button has a `primary` background with white text, including icon buttons and header controls. Exceptions: the green WhatsApp button, and controls that show a state (carousel dots, the pages you are not on in pagination, assistant choices), where only the selected one is solid.
- **Primary button:** pill with the black arrow circle. Use one per view.
- **Technology cards:** a 1px `primary` border.
- **Client logos:** full-colour logos on white tiles, in a row that moves right to left.
- **Project mosaic:** no border, no movement and no text on hover, only the images.
- **Image cards:** service, product, case study, team, project, review and delivery cards share one look, taken from the client's reference: a large image, 24px corners, and text on a dark gradient at the bottom in both themes. Cards with more text use `imageCardClass` and `imageCardBodyClass`. They have no border at rest and a light `primary/40` one on hover, and images do not zoom. Project cards keep a `primary` border, using `ProjectCard`. Review cards have a glass play button that turns brand purple on hover.
- **Project carousel:** three equal cards on desktop, two on tablet, one on phones. One card every 2 seconds, right to left. Under a hairline: Explore More Portfolio on the left, linking to `/project`, and the two arrows on the right. No counter, progress line or dots. The navy band has a soft purple light at the top and a faint fading grid (`.projects-band`).
- **Outcome cards:** admin-managed cards above Customer Reviews. From 1024px they stick under the header and pile up, each stopping 56px lower so its small label stays visible, while the one beneath settles back a little. The step shrinks on short screens so the top card always fits. On smaller screens they are ordinary cards with a scroll reveal, because a stuck card taller than the screen could not be read.
- **Delivery Stories:** photo cards with the text over the image, in a row that moves right to left across the full width, with no numbers. Admins add as many as they like; the row repeats them to fill wide screens and keeps the same speed per card. Each photo drifts inside its card as the page scrolls. Scroll-driven photos need `overflow-clip` on the card, because `overflow-hidden` would become their timeline.
- **Eyebrow chip:** tinted pill with a dot, above section headings.
- **Taka on the Bangla site:** prices are entered in dollars; with "Prices In Taka" on (Contact & Links), the Bangla pricing cards and products show ৳ first, at the admin's rate, rounded to the chosen step, in Bangla digits with lakh grouping (৳২,৪৩,৯০০).
- **Pricing plans:** three plans (Free, Starter, Enterprise), laid out after the client's ChatGPT reference: name and badge, tagline, price with a small symbol and an optional label beside it, a full-width pill button, a hairline, ticked features, and an optional note at the foot. Cards have 24px corners and the standard `gap-5`, and all line up. The highlighted plan stands out through colour only: a lavender fill, `primary` border and ring, filled ticks and a brand glow. The label, button text, features and note are set per plan in the admin panel.
- **Pricing buttons:** `plan-btn` lifts the button, passes a light across it and slides in an arrow on hover and keyboard focus.
- **Final Inquiry:** a dark panel with 32px corners inside `container-page`, in both themes, after the client's Revilo reference: two curved lines of purple light rising from the lower corners, a short glowing line at the top, and glass buttons. It has the normal section space above and below.
- **Header and footer content** comes from the admin's Menu & Footer screen: menu links, the header button's link, both footer link columns, social links (icons from Simple Icons; LinkedIn is drawn as its letters because that set dropped it) and any number of offices. The copyright year is the current year.
- **Footer:** flat background with no gradients and no cards. Brand and links on top, a contact row under a hairline, the name faintly across the full width in its own band so it never runs behind content, then the copyright, Privacy Policy and Crafted in Dhaka & Rome on the left, clear of the WhatsApp button. Text is `fg/85` (`white/85` in dark mode), brighter than `muted`, and links turn pure white on hover in dark mode and the full brand purple `primary` in light mode.
- **Problems picture:** the right side of the Problems card is one picture in a thin glass frame (`border-white/10`, 1.5rem corners, a soft drop shadow), cropped to 3:2. The admin sets it under Contact & Links; its description is Website Text → Problems → Image Alt.
- **Footer wordmark:** the large site name is a light tint of the brand colour, strongest at the top and fading into the footer. On the dark footer the colour is mixed with white first, so it reads as a soft glow; on the cream footer it is lighter still.

## Motion

- Scroll reveals use CSS view timelines; unsupported browsers just show content.
- Animate `transform` and `opacity` only. Always name transition properties; never use `transition: all`.
- **Smooth on phones.** Entrance and reveal animations set only their `from` frame and fill `backwards`, so the GPU layer is freed once they end; `both` kept every animated word on a layer of its own. Moving rows, the carousel and the hero drift pause off screen (`useOffscreen`). The ends of moving rows fade with gradient overlays in the section colour (`.fade-edges`), never `mask-image`, which is slow over moving content. No scroll-driven animation inside a moving row, and no `backdrop-filter` below desktop sizes. Check with the layer count: the homepage drew 173 layers before this and about 50 after.
- Everything respects `prefers-reduced-motion`: moving rows stand still and wrap, and the carousel stops.
- **No pause buttons**, by the owner's choice. Moving rows stop under the mouse and can be dragged (`DraggableMarquee`); the carousel stops on hover and keyboard focus.

## Content rules

- All copy lives in `src/i18n/en.ts` and `bn.ts`, or in the database as `{ en, bn }`. No hardcoded strings in components.
- Use real client names and work. Never invent testimonials, metrics or logos.
- English headings and buttons use Title Case. Format numbers and prices with `Intl` through `src/lib/format.ts`.

## Admin panel

Always dark. All measurements come from `components/admin/ui.tsx`, so screens line up: cards `gap-5` apart with `p-6 sm:p-7` inside, page blocks `mt-8` apart, list rows `px-5 py-4`, controls at least 40px tall. Cards answer hover with an `accent/50` border and a lighter fill; rows with a faint fill. Use `PageHeader`, `SaveBar` and `EmptyState` on any new screen. Forms stay `max-w-4xl`; lists and the dashboard use the full `max-w-6xl`.

What admins can change: the record lists in `lib/admin/resources.ts`, every built-in sentence under Website Text (`lib/siteText.ts`, stored as overrides by dictionary path), and contact details, links and section photos under Contact & Links. Public server code reads text through `getSiteDictionary`, not `getDictionary`, or admin edits will not show.

New content sections must be added to `ALLOWED_RESOURCES` in the admin proxy, and to `TRACKED` in the API's `activityTrail` so they appear in the Activity Log.
