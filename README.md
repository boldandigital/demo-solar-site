# scroll-shared

The base UX skeleton for the **Bold & Digital scroll-narrative demo fleet**.
Every vertical demo (e.g. `scroll-realestate`, `scroll-hospitality`, `scroll-events`)
forks from this repo, then swaps the hero/copy/assets and brand tokens.

## What ships here

- **Next.js 16** App Router + **TypeScript strict**
- **Tailwind CSS 4** with a locked neutral palette (`#FAFAFA` bg, `#0A0A0A` text,
  `#E5E5E5` borders) and CSS-variable-based dark mode
- **GSAP 3 + ScrollTrigger** registered globally, driven by the GSAP ticker
- **Lenis** smooth scroll wired into the ticker so ScrollTrigger stays in sync
- **next-intl v4** locale routing for **EN / NL / PT-BR**
- **shadcn/ui** initialized (only the Button primitive added — add more on demand)
- Inter as the body font (no display font — per-vertical choice)
- Accessibility-aware: `prefers-reduced-motion` disables Lenis; `useSyncExternalStore`
  for the dark-mode toggle avoids SSR mismatch and cascading renders

### Routes

| Path | Notes |
| --- | --- |
| `/[locale]` | Single-viewport hero placeholder. Text: "Demo hero goes here". |
| `/[locale]/about` | Placeholder. |
| `/[locale]/contact` | Placeholder. Floating WhatsApp button lives in the root locale layout. |

Middleware redirects `/` to the user's preferred locale (default `/en`).

### Components

| File | Purpose |
| --- | --- |
| `src/components/SmoothScrollProvider.tsx` | Lenis driven by GSAP ticker; ScrollTrigger recomputed per Lenis frame |
| `src/components/Nav.tsx` | Sticky top nav + locale switcher + dark-mode toggle |
| `src/components/Footer.tsx` | Minimal footer with B&D mark + language switcher |
| `src/components/WhatsAppButton.tsx` | Floating sticky button. Phone defaults to a placeholder; pass `phone="..."` per demo. |
| `src/components/SectionReveal.tsx` | Fades children in (with a small upward translation) on first viewport entry |
| `src/components/MagneticButton.tsx` | Cursor-following CTA. Use on per-vertical hero CTAs. |
| `src/components/DarkModeToggle.tsx` | Toggles `[data-theme="dark"]` on `<html>` and `.dark` class for shadcn |

## Local dev

```bash
npm install
npm run dev      # http://localhost:3000  → redirects to /en
npm run build    # static prerender of all 12 (3 locales × 3 routes + 404)
npm run lint     # ESLint
```

Node ≥ 20 required (Vercel default). npm ≥ 10.

## Forking for a new vertical

```bash
# 1. Clone this repo as your new vertical
gh repo create boldandigital/scroll-<vertical> --private --clone --source scroll-shared
cd scroll-<vertical>

# 2. Rename the npm package
# Edit package.json → "name": "scroll-<vertical>"

# 3. Swap the brand layer
# - src/app/[locale]/page.tsx         → real hero copy, image, scroll narrative
# - src/app/globals.css               → brand palette tokens (replace neutral hex values)
# - src/app/layout.tsx                → swap Inter for a per-vertical display font if needed
# - src/components/WhatsAppButton.tsx → pass `phone="..."` for the actual venue number
# - src/i18n/messages/*.json          → real copy in each locale

# 4. (Optional) Add shadcn primitives
npx shadcn@latest add card dialog sheet

# 5. Push & preview
git push origin main
vercel --prod
```

The skeleton stays neutral on purpose. Every per-vertical change should land in
**your fork**, not here. Pull requests back to `scroll-shared` are only for
shared infra improvements (new provider, new component, new i18n locale, etc.).

## Adding a new locale

1. Add the code to `src/i18n/routing.ts` → `locales: ["en", "nl", "pt-BR", "<new>"]`
2. Add `src/i18n/messages/<new>.json` (copy `en.json` and translate)
3. Restart the dev server

## Styling tokens

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--background` | `#FAFAFA` | `#0A0A0A` | Page background |
| `--foreground` | `#0A0A0A` | `#FAFAFA` | Primary text |
| `--border` | `#E5E5E5` | `#262626` | Hairlines, dividers, button outlines |
| `--muted` | `#F5F5F5` | `#171717` | Subtle fills |
| `--muted-foreground` | `#737373` | `#A3A3A3` | Secondary text |
| `--surface` | `#FFFFFF` | `#171717` | Cards, popovers |
| `--primary` | `#0A0A0A` | `#FAFAFA` | CTA fill |

Tailwind utilities like `bg-background`, `text-foreground`, `border-border`,
`text-muted-foreground` map directly to these.

## Stack reference

- Next.js 16 (App Router, RSC, Turbopack default)
- React 19
- GSAP 3 + ScrollTrigger (free version)
- Lenis 1.x
- next-intl 4.x
- shadcn/ui (base-nova preset, neutral base color, Lucide icons)
- Tailwind CSS 4
- TypeScript 5 strict
