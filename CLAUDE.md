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
src/proxy.ts            Redirects / to /en or /bn using the cookie, then Accept-Language
src/i18n                Dictionaries. bn.ts is typed against en.ts, so missing keys fail typecheck
src/components/layout   Header, Footer, ThemeToggle, LanguageSwitch, WhatsAppButton
src/components/sections One file per homepage section, plus client parts (carousel, tabs, form)
src/components/ui       Shared buttons, headings and icons
src/lib                 API client, types, formatters and contact details
```

## Conventions

- Components are server components unless they need state. Interactive pieces are small separate client files.
- Static copy comes from dictionaries. List content comes from `GET /home` in `lib/api.ts`, with ISR every 60 seconds.
- `lib/api.ts` throws at runtime so Next.js keeps the last good page when the API is down; it returns empty data only
  during a build.
- The theme is set on `<html data-theme>` by an inline script before paint. Changing locale remounts `<html>`, so
  `ThemeToggle` restores it in a layout effect.
- Next.js does not scroll on query-and-hash navigation, so links that preselect a service use `ServiceLink`.

## Git

Commit with the configured `Ebratul` identity. **Never add `Co-Authored-By` trailers or "Generated with" footers**: the
owner does not want Claude listed as a contributor. Write a summary line and a body explaining what and why.
