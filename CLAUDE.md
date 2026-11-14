# Webnion Frontend

The Webnion marketing site: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4. Bilingual (`/en`, `/bn`) with light
and dark themes. **Read `DESIGN.md` before changing any UI.**

## Commands

```bash
npm run dev         # Site on :3000. The API must be running on :5000 for database content
npm run build && npm start
npm run typecheck
```

## Layout

```
src/app/[locale]        Root layout (fonts, <html lang>, theme script), page, error and 404 pages
src/app/[locale]/services/[slug], project/[slug], case-studies/[slug]   Detail pages, fetched by slug from the API
src/app/[locale]/contact  Contact page, with the longer project form
src/app/[locale]/team     Team page, with a card for each member from the homepage data
src/app/[locale]/service, project, products, case-studies   Listing pages. Filters live in the address, so results can be shared.
                        Portfolio, Case Studies and Blog show 12 cards and a See More button that adds 12 (`ShowMoreGrid`). Cards
                        it adds rise row by row (`data-enter` in globals.css). Their pictures use `CardCover`, which never crops
src/app/admin           Admin panel with its own root layout. Screens are built from lib/admin/resources.ts
src/app/api/admin       Login, logout and a proxy that adds the token from an httpOnly cookie to API calls
src/proxy.ts            Redirects / to /en or /bn using the cookie, then Accept-Language. Gates /admin
src/i18n                Dictionaries. bn.ts is typed against en.ts, so missing keys fail typecheck
src/components/layout   Header, Footer, ThemeToggle, LanguageSwitch, WhatsAppButton
src/components/sections One file per homepage section, plus client parts (carousel, tabs, form)
src/components/ui       Shared buttons, headings and icons
src/lib                 API client, types, formatters and contact details
```

## Conventions

- Components are server components unless they need state. Interactive pieces are small separate client files.
- Admin screens are English only, so their copy lives in `lib/admin/resources.ts` and the admin components, not the dictionaries.
- Admin images are upload-only: `next/image` rejects unknown hosts, so a pasted link would break the public page.
- Static copy comes from dictionaries, merged with admin edits by `getSiteDictionary` in `lib/siteSettings.ts`. Server code uses that one; `getDictionary` is for client error pages and the admin text screen. Contact details come from `getContact`, the name, logos and colour from `getBrand`, hidden homepage sections from `getHiddenSections` (keys in `lib/homeSections.ts`). Menus, footer links, social links and offices come from `getNavigation` (`lib/navigation.ts`); store links without the language (`/contact`, `#pricing`) and resolve them with `resolveHref`. Site options (WhatsApp button, budgets) come from `getOptions`.
- List content comes from `GET /home` in `lib/api.ts`, with ISR every 60 seconds.
- `zoom` on `.site-zoom` shows the public site at 110% from 768px up. Divide screen-based sizes by `--page-zoom`, and convert `offsetWidth` when comparing it with pointer positions.
- Links to homepage sections use `sectionHref`, so they also work from detail pages. Pages use `PageShell` for the header and footer.
- `lib/api.ts` throws at runtime so Next.js keeps the last good page when the API is down; it returns empty data only
  during a build.
- `<html data-scroll-behavior="smooth">` lets Next.js turn smooth scrolling off while it opens a page, so a menu link lands at
  the top at once instead of gliding there. Keep it while `html` has `scroll-behavior: smooth`.
- The theme is set on `<html data-theme>` by an inline script before paint. Changing locale remounts `<html>`, so
  `ThemeToggle` restores it in a layout effect.
- Blog: `/[locale]/blog` (tag filter in the address) and `/[locale]/blog/[slug]` with BlogPosting JSON-LD, from
  `getBlogPosts` and `getBlogPost`. The homepage Blog section (key `blog`) shows the three newest posts.
- Chat assistant (`components/chat`): `PageShell` shows `ChatWidget` when `getAiPublicConfig` says so. It calls the API's
  `/ai/chat` directly and reads Server-Sent Events. Answers are rendered by `ChatMarkdown` as React elements, never HTML,
  with links kept only for site paths and https. An inquiry the assistant proposes is shown in `InquiryCard` and sent
  only when the visitor presses Send. The admin panel has its own chat through `/api/admin/ai/chat/admin`.
- Inquiries: the contact form and chat show the API's spam-rule refusals (`code` such as `INQUIRY_COOLDOWN`) in the visitor's
  language through `lib/inquiryErrors.ts`. Admins edit the rules under Leads → Spam Filter and can block a sender from an inquiry.
- Blog posts are edited in `BlogPostForm` (writing column, publishing card, a sticky "Ready to publish" checklist, search preview),
  not the generic `ResourceForm`. It still uses the blog-posts entry in `lib/admin/resources.ts` for loading and saving.
- Admin AI screens: AI Settings (`AiSettingsForm`, keys are typed but never shown back), AI Studio (`AiStudio`: outline,
  draft, pictures, Bangla), AI Usage, and the Blog resource. The admin proxy allows `ai` and `blog-posts` and has a
  five-minute limit for AI Studio. AI Settings sends the built-in site text (`lib/admin/siteTextDocuments.ts`) to the API
  so the assistant can answer from it.
- The inquiry form lives in a dialog (`InquiryDialog`). Links that preselect a service use `ServiceLink`, which opens it.

## Git

Commit with the configured `Ebratul` identity. **Never add `Co-Authored-By` trailers or "Generated with" footers**: the
owner does not want Claude listed as a contributor. Write a summary line and a body explaining what and why.
