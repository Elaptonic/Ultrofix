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
- **API codegen**: Orval (from OpenAPI spec → `lib/api-spec/openapi.yaml`)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Urban Company Mobile App (`artifacts/urban-app`)

A fully-featured Urban Company-style home services marketplace mobile app built with Expo/React Native. Backed by a real Express + Drizzle + PostgreSQL API.

**Features:**
- Home screen with hero banner, service categories, popular services, top providers (real API data)
- 8 service categories (Cleaning, Plumbing, Electrical, Salon, Painting, Pest Control, Carpentry, Appliances)
- Service detail page with provider selection and booking flow
- Date & time slot selection for bookings
- Booking management (Upcoming, Completed, Cancelled tabs) — real bookings persisted in DB
- Save/unsave services (persistent via AsyncStorage)
- Search with category filters (real API data)
- Address management (saved + custom)
- Notification center
- Profile editing (persisted to DB via `useUpsertProfile`)

**Navigation:** 4-tab structure (Home, Bookings, Saved, Profile) + stack screens for service detail, booking, search, category, address, notifications

**Auth:** No auth yet — hardcoded `USER_ID = "default-user"` (see `constants/user.ts`)

**Storage:** AsyncStorage for saved services and selected address. Profile stored in DB via API.

**Design:** Orange (#f97316) primary color, Inter fonts, mobile-native UI patterns

### API Server (`artifacts/api-server`)
Express 5 backend with endpoints:
- `GET /services` — list services (filterable by `?category=`)
- `GET /services/:id` — get single service
- `GET /providers` — list providers (filterable by `?category=`)
- `GET /bookings?userId=` — list bookings for a user
- `POST /bookings` — create a booking
- `PATCH /bookings/:id` — update booking status or rating
- `GET /profile/:userId` — get user profile
- `PUT /profile/:userId` — upsert user profile

Database seeded automatically on server start (idempotent seed via `lib/seed.ts`).

## DB Schema (`lib/db/src/schema/`)
- `services` — service listings
- `providers` — professionals
- `bookings` — booking records (denormalized service/provider names)
- `profiles` — user profiles

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
