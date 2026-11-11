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
src/app/[locale]/service, project, products, case-studies   Listing pages. Filters and paging live in the address, so results can be shared
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
- Static copy comes from dictionaries, merged with admin edits by `getSiteDictionary` in `lib/siteSettings.ts`. Server code uses that one; `getDictionary` is for client error pages and the admin text screen. Contact details come from `getContact`, the name, logos and colour from `getBrand`, hidden homepage sections from `getHiddenSections` (keys in `lib/homeSections.ts`).
- List content comes from `GET /home` in `lib/api.ts`, with ISR every 60 seconds.
- `zoom` on `.site-zoom` shows the public site at 110% from 768px up. Divide screen-based sizes by `--page-zoom`, and convert `offsetWidth` when comparing it with pointer positions.
- Links to homepage sections use `sectionHref`, so they also work from detail pages. Pages use `PageShell` for the header and footer.
- `lib/api.ts` throws at runtime so Next.js keeps the last good page when the API is down; it returns empty data only
  during a build.
- The theme is set on `<html data-theme>` by an inline script before paint. Changing locale remounts `<html>`, so
  `ThemeToggle` restores it in a layout effect.
- The inquiry form lives in a dialog (`InquiryDialog`). Links that preselect a service use `ServiceLink`, which opens it.

## Git

Commit with the configured `Ebratul` identity. **Never add `Co-Authored-By` trailers or "Generated with" footers**: the
owner does not want Claude listed as a contributor. Write a summary line and a body explaining what and why.
