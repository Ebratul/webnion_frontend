# Webnion Frontend

The [Webnion](https://webnion.com) marketing website, built with Next.js, TypeScript and Tailwind CSS. It is available in
English and Bangla, with light and dark themes.

## Getting Started

Requires Node.js 22+ and the [Webnion backend](https://github.com/Ebratul/webnion_backend) running locally.

```bash
npm install
cp .env.example .env.local
npm run dev                  # http://localhost:3000
```

## Environment

| Variable | Purpose |
| --- | --- |
| `API_URL` | API address used by the server to fetch homepage content |
| `NEXT_PUBLIC_API_URL` | API address used by the browser to submit the inquiry form |
| `NEXT_PUBLIC_SITE_URL` | Public site address for canonical URLs and the sitemap |

## Editing Content

- Section headings and marketing copy: `src/i18n/en.ts` and `src/i18n/bn.ts`
- Services, projects, products, case studies, testimonials, pricing, FAQs, team and logos: stored in the database and managed in the admin panel at `/admin`
- Contact details and social links: `src/lib/site.ts`
- Colours and design rules: `DESIGN.md` and `src/app/globals.css`
