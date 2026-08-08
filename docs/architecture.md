# Architecture — Kairos Labs

**Version:** 2.0.0
**Last updated:** 2026-08-08
**Stack:** Next.js 15 · Supabase · Vercel · GitHub Actions

---

## Overview

Kairos Labs is a statically-rendered public landing page with a server-rendered private founder dashboard. The architecture is optimized for zero infrastructure cost, maximum security, and full SEO indexability of the public surface.

Product data follows a **Single Source of Truth** pattern via `lib/products/` — a data layer designed as a future integration point for the DevPrint API.

---

## Component Map

```
lib/
├── products/
│   ├── types.ts                ← Product interface (Funcionalidade, Product)
│   └── index.tsx               ← getProducts() + productNames — single source of truth
├── product-names.ts            ← Re-export of productNames from lib/products (compat)
├── supabase.ts                 ← Browser client (anon key, public insert only)
├── supabase-server.ts          ← Server clients (SSR + admin)
└── types.ts                    ← Shared TypeScript interfaces (Database schema)

app/
├── page.tsx                    ← Landing page: HeroSection + Products (Server, static)
├── layout.tsx                  ← Root layout (font, metadata)
├── robots.ts / sitemap.ts      ← SEO automation
├── solucoes/
│   ├── page.tsx                ← Solutions index (Server Component, static)
│   └── [slug]/page.tsx         ← Solution detail page (SSG via generateStaticParams)
└── admin/
    ├── page.tsx                ← Founder dashboard (Server Component, protected)
    ├── login/
    │   ├── page.tsx            ← Login page (Server Component)
    │   └── _components/
    │       └── LoginForm.tsx   ← Login form (Client Component — form interaction)
    └── logout/
        └── route.ts            ← Logout Route Handler

components/
├── sections/                   ← Public page sections (Server Components)
│   ├── Header.tsx
│   ├── HeroSection.tsx / HeroContent.tsx
│   ├── Products.tsx            ← Landing page product grid (calls getProducts())
│   ├── FeatureCards.tsx
│   ├── NavBar.tsx
│   └── Footer.tsx
├── waitlist/                   ← Lead capture (Client Components — modal + form)
│   ├── WaitlistModal.tsx
│   ├── WaitlistCTAButton.tsx
│   └── waitlist-action.ts      ← Server Action (INSERT to Supabase)
├── feedback/                   ← Suggestion capture (Client Components)
│   ├── FeedbackModal.tsx
│   ├── FeedbackCTAButton.tsx
│   └── feedback-action.ts      ← Server Action
├── admin/                      ← Dashboard widgets (Client Components — charts/tables)
│   ├── KPICard.tsx
│   ├── DemandChart.tsx         ← Reads productNames from lib/products
│   └── LeadsTable.tsx
└── ui/                         ← shadcn/ui primitives + shared modal components
```

---

## Product Data Layer

All product data — name, tagline, description, PRD content, color, icon, status — lives exclusively in `lib/products/index.tsx`. Every component that needs product information calls `getProducts()`.

### Today (static)

```ts
// lib/products/index.tsx
export function getProducts(): Product[] {
  return products; // hardcoded array
}
```

### Post-DevPrint Integration (future)

```ts
export async function getProducts(): Promise<Product[]> {
  return fetch("https://api.devprint.io/v1/products", {
    next: { revalidate: 3600 },
  }).then((r) => r.json());
}
```

`getProducts()` is the **only seam** between the data layer and the UI. All consuming components (`app/page.tsx`, `app/solucoes/page.tsx`, `app/solucoes/[slug]/page.tsx`, `DemandChart`) require zero changes when the implementation switches from static to API-driven.

### productNames

`productNames` (a `Record<string, string>`) is derived automatically from `getProducts()` and used by the admin dashboard to resolve display names from `product_id` values stored in the database.

---

## Server vs Client Components

| Surface | Rendering | Reason |
|---|---|---|
| Landing page sections (Hero, Products, etc.) | **Server** | Static HTML, SEO-indexed, no interactive state needed |
| WaitlistCTAButton / WaitlistModal | **Client** | User interaction, controlled input, transition state |
| FeedbackCTAButton / FeedbackModal | **Client** | Same as above |
| `/solucoes` index page | **Server** | Pure render from getProducts(), no client state |
| `/solucoes/[slug]` detail page | **Server** | SSG, data from getProducts(), CTAs are leaf Client Components |
| `/admin` dashboard | **Server** | Data fetched server-side before render; no layout shift |
| Dashboard charts/table | **Client** | Recharts requires DOM access; data passed as props from server |
| Login form | **Client** | Form state, submission handling |

Client Components (`WaitlistCTAButton`, `FeedbackCTAButton`) are used as **leaf nodes** inside Server Components — the parent renders as static HTML, the leaf hydrates independently. This is the correct App Router composition pattern.

---

## Styling Strategy

- **Tailwind CSS v4** for all static layout, spacing, typography, border, and color utilities.
- **Inline `style` prop** reserved exclusively for runtime-dynamic values: product accent color (a prop, not a static class).
- Result: component files are 60–70% shorter than equivalent inline-style code, and hover/focus states are handled by CSS (no JavaScript event handlers for styling).

---

## Data Flow

### 1 — Visitor → Waitlist

```
Visitor
  │
  ├─ GET /  (static, CDN-cached)
  │     └─ Products section: Server Component calls getProducts()
  │           renders cards with WaitlistCTAButton (leaf Client Component)
  │
  └─ clicks "Garantir Acesso Antecipado"
        │
        └─ WaitlistModal opens (Client Component)
              │
              └─ user submits email
                    │
                    └─ Server Action: waitlist-action.ts
                          │
                          └─ Supabase anon client
                                INSERT INTO waitlist (email, product_id)
                                RLS policy: "Allow public insert" (CHECK true)
                                │
                                └─ success panel ← user sees confirmation
```

### 2 — Founder → Dashboard

```
Founder
  │
  └─ GET /admin  (no session)
        │
        └─ middleware / server check → redirect to /admin/login
              │
              └─ LoginForm (Client Component)
                    │
                    └─ supabase.auth.signInWithPassword()
                          │
                          └─ Supabase Auth issues JWT
                                │
                                └─ redirect to /admin
                                      │
                                      └─ admin/page.tsx (Server Component)
                                            │
                                            ├─ supabase.rpc("get_dashboard_kpis")
                                            │     └─ SECURITY DEFINER function
                                            │
                                            └─ renders KPICard + DemandChart + LeadsTable
                                                  (data passed as props → Client Components)
```

---

## Supabase Security Model

```
┌─────────────────────────────────────────────────────┐
│                     waitlist table                  │
│                                                     │
│  RLS: ENABLED                                       │
│                                                     │
│  Policy 1 — "Allow public insert"                   │
│    FOR INSERT: CHECK (true)                         │
│    → Any visitor can submit their email             │
│                                                     │
│  Policy 2 — "Founder-only access"                   │
│    FOR SELECT: auth.jwt()->>'email' = FOUNDER_EMAIL │
│    → Only the founder's authenticated session reads │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│             get_dashboard_kpis (RPC)                │
│                                                     │
│  SECURITY DEFINER                                   │
│  SET search_path = public                           │
│  GRANT EXECUTE TO authenticated                     │
│                                                     │
│  → Runs with function owner's privileges            │
│  → Returns only aggregated KPIs, never raw emails   │
│  → Prevents service_role from being used for reads  │
└─────────────────────────────────────────────────────┘
```

### Client selection rules

| Operation | Client used | Key |
|---|---|---|
| Public INSERT (waitlist/feedback) | `createBrowserClient` | `anon` |
| Dashboard reads (admin page) | `createServerSupabaseClient` + RPC | `anon` + JWT |
| Admin writes (future) | `createServerAdminClient` | `service_role` |

`service_role` is never used for read operations. It bypasses RLS entirely and is reserved exclusively for administrative writes that must skip row-level policies.

---

## CI/CD Pipeline

```
git push → GitHub
  │
  └─ GitHub Actions: ci.yml
        │
        ├─ npm ci --ignore-scripts
        ├─ eslint (0 warnings allowed)
        ├─ jest --coverage
        ├─ next build
        └─ SonarCloud analysis (Quality Gate must be green)
              │
              └─ Vercel deploy (automatic, on merge to main)
```

Pre-commit hook (Husky + lint-staged): ESLint runs on every `git commit` against staged `.ts`/`.tsx` files. Commit is blocked if any warning exists.

---

## Key Architectural Decisions

### Single Source of Truth for product data
All product information lives in `lib/products/index.tsx`. Adding, renaming, or removing a product requires editing exactly one file. The `getProducts()` function signature is designed to remain stable when the data source changes from static to the DevPrint API.

### App Router over Pages Router
Next.js 15 App Router enables granular Server/Client boundary control. Public pages are fully static (fast CDN delivery, perfect Lighthouse scores). The admin route fetches data server-side before the first paint, eliminating loading spinners on the dashboard.

### Supabase Free Tier as complete backend
PostgreSQL + Auth + RLS covers all MVP requirements at zero cost. RLS eliminates the need for a custom API layer — security is enforced at the database level, not the application layer.

### SECURITY DEFINER RPC for dashboard aggregations
Rather than granting the authenticated user direct SELECT on the waitlist table (which would expose all emails), the dashboard reads through a PostgreSQL function that returns only aggregated metrics. The function runs as its owner, not the caller.

### shadcn/ui over a full component library
shadcn/ui copies source into the repo. Components are owned, not imported — no dependency upgrades break the UI, and each component can be modified without forking.

### Tailwind CSS over inline styles
Static layout and typography use Tailwind utilities. Runtime-dynamic values (product accent color) use inline style exclusively for those specific properties. This eliminates verbose inline style objects and makes components significantly more readable.

### SonarCloud Quality Gate as merge blocker
No PR is merged with open Sonar issues. This keeps the codebase at a demonstrable professional standard, which is a core goal of the platform (the repo itself is a portfolio artifact).
