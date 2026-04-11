# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Urban Company Mobile App (`artifacts/urban-app`)

A fully-featured Urban Company-style home services marketplace mobile app built with Expo/React Native.

**Features:**
- Home screen with hero banner, service categories, popular services, top providers
- 8 service categories (Cleaning, Plumbing, Electrical, Salon, Painting, Pest Control, Carpentry, Appliances)
- Service detail page with provider selection and booking flow
- Date & time slot selection for bookings
- Booking management (Upcoming, Completed, Cancelled tabs)
- Save/unsave services (persistent via AsyncStorage)
- Search with category filters
- Address management (saved + custom)
- Notification center
- Profile editing

**Navigation:** 4-tab structure (Home, Bookings, Saved, Profile) + stack screens for service detail, booking, search, category, address, notifications

**Storage:** AsyncStorage for local persistence (saved services, address, profile)

**Design:** Orange (#f97316) primary color, Inter fonts, mobile-native UI patterns

### API Server (`artifacts/api-server`)
Express 5 backend (shared, used by all artifacts)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
