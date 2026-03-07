# replit.md

## Overview

This is an African safari travel planning application powered by AI. Users type a natural language prompt (e.g., "7 day Kenya safari for $3500 in August") and receive a detailed, formatted itinerary in response. The app also includes server-side logic for trip data extraction, operator scoring/lead routing, and analytics tracking.

Key features:
- AI-generated safari itineraries via a `/api/generate` POST endpoint
- Natural language trip data extraction (destinations, budget, duration, group size, travel dates)
- Operator registry with lead matching based on destination/budget scoring
- Clean, minimal UI with smooth Framer Motion animations

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React** (Vite, TypeScript) single-page application located in `client/src/`
- **Routing**: Minimal — primary page is `Home.tsx`, with a `not-found.tsx` fallback
- **State & Data Fetching**: TanStack React Query (`@tanstack/react-query`) with a custom `useGenerate` mutation hook
- **UI Components**: shadcn/ui component library (Radix UI primitives + Tailwind CSS), located in `client/src/components/ui/`
- **Animations**: Framer Motion for staggered entry animations and loading states
- **Forms**: `react-hook-form` + `@hookform/resolvers` + Zod for validation
- **Styling**: Tailwind CSS with CSS custom properties for theming; fonts from Google Fonts (Albert Sans, Plus Jakarta Sans)
- **Custom Components**:
  - `Textarea.tsx` — auto-resizing textarea using `react-textarea-autosize`
  - `Loader.tsx` — animated shimmer loading skeleton

### Backend Architecture
- **Express.js** server (`server/index.ts`) with TypeScript via `tsx`
- **API route**: `POST /api/generate` — receives a prompt, generates an itinerary response
- **Shared route contracts**: `shared/routes.ts` defines typed API contracts using Zod schemas, shared between client and server
- **In-memory stores** (in `server/routes.ts`):
  - `tripStore` — stores generated trip objects
  - `analyticsStore` — analytics events
  - `leadsStore` — captured leads
  - `operatorRegistry` — registered tour operators
  - Duplicate lead prevention via `recentLeadEmails` with a 24-hour window
- **Storage layer**: `server/storage.ts` provides a `MemStorage` class implementing `IStorage` for generation records (in-memory, not persisted to DB)
- **Build**: Custom build script (`script/build.ts`) using esbuild for server and Vite for client; server deps allowlisted for bundling

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM (`drizzle-orm/pg-core`)
- **Schema** (`shared/schema.ts`):
  - `generations` table: `id`, `prompt`, `response`, `createdAt`
  - `trips` table: `id` (text PK), `prompt`, `itinerary`, `costData`, `wildlifeData`, `createdAt`
- **Migrations**: Drizzle Kit, output to `./migrations/`, push via `db:push` script
- **Current storage implementation**: `MemStorage` is used in practice (not the DB), so the database tables exist but may not be actively written to yet
- **Config**: Requires `DATABASE_URL` environment variable

### Shared Code Pattern
- `shared/` directory contains schema and route definitions consumed by both client and server
- TypeScript path aliases: `@/*` → `client/src/*`, `@shared/*` → `shared/*`

### API Contract Design
Routes are defined as typed objects in `shared/routes.ts` with method, path, input schema, and response schemas — ensuring client and server stay in sync without a separate API codegen step.

### Development vs Production
- Dev: Vite dev server embedded in Express via `server/vite.ts` (middleware mode with HMR)
- Prod: Vite builds to `dist/public/`, Express serves static files from there
- Replit-specific plugins: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` (dev only)

## External Dependencies

### AI / LLM
- The `/api/generate` endpoint is referenced throughout but the actual AI provider call is not fully visible in the shared files. The build allowlist includes `@google/generative-ai` and `openai`, suggesting one or both may be used. The client requirements note says the endpoint returns `{ response }` as a non-streaming JSON response.

### Database
- **PostgreSQL** — required via `DATABASE_URL` env var
- **Drizzle ORM** — schema definition and query building
- **drizzle-zod** — auto-generates Zod schemas from Drizzle table definitions

### Session / Auth (referenced in build allowlist, not fully implemented in visible code)
- `express-session` + `connect-pg-simple` — session storage in Postgres
- `passport` + `passport-local` — local auth strategy
- `jsonwebtoken` — JWT support

### Other Notable Packages (in build allowlist, available for use)
- `stripe` — payments
- `nodemailer` — email sending
- `multer` — file uploads
- `ws` — WebSocket support
- `xlsx` — spreadsheet handling
- `express-rate-limit` — rate limiting
- `nanoid` / `uuid` — ID generation

### Mobile Responsiveness
- Implemented via CSS media queries in `client/src/index.css` with `@media (max-width: 768px)` breakpoint
- Uses `!important` overrides to override inline styles in App.tsx
- Responsive class naming convention: `r-*` prefixed classes (e.g., `r-nav-main`, `r-grid-2`, `r-grid-quote`, `r-op-tabs`, `r-profile-grid`)
- All major grids, navigation tabs, sections, modals, headings, and forms are covered
- Grids with `auto-fill`/`minmax` patterns (destinations, animals) are inherently responsive
- Strategy: className attributes on JSX elements + CSS media queries, NOT inline isMobile conditionals

### UI / Client Libraries
- Radix UI (full suite of primitives)
- Framer Motion — animations
- Recharts — charts (via `chart.tsx`)
- Embla Carousel — carousel component
- `react-day-picker` — calendar/date picker
- `vaul` — drawer component
- `cmdk` — command palette
- `lucide-react` — icons
- `date-fns` — date utilities
- `tailwind-merge` + `clsx` + `class-variance-authority` — class handling utilities