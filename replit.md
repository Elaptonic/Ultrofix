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

**Navigation:** 4-tab structure (Home, Bookings, Saved, Profile) + stack screens for service detail, booking, search, category, address, notifications, vendor/radar

**Vendor Dispatch Loop:**
- Profile screen has "Continue as Provider" button → opens `/vendor/radar`
- Radar screen connects via Socket.IO, emits `register-vendor` to go online
- Server tracks live vendors in `vendorSockets: Map<providerId, socketId>`
- On new booking: `assignNearestProvider` (haversine in `lib/db/src/matcher.ts`) finds closest online vendor → emits `NEW_LEAD` to their socket
- If no vendor online: falls back to `bookingQueue` auto-acceptance (4 s delay)
- Vendor sees Accept/Deny modal; Accept emits `vendor:accept` → server updates booking to `accepted`, pushes `booking:status` to consumer + creates notification; Deny emits `vendor:deny` → re-queues fallback

**Auth:** No auth yet — hardcoded `USER_ID = "default-user"` (see `constants/user.ts`)

**Storage:** AsyncStorage for saved services and selected address. Profile stored in DB via API.

**Design:** Orange (#f97316) primary color, Inter fonts, mobile-native UI patterns

### API Server (`artifacts/api-server`)
Express 5 backend with endpoints:
- `GET /services` — list services (filterable by `?category=`)
- `GET /services/:id` — get single service
- `GET /providers` — list providers (filterable by `?category=`)
- `GET /providers/match?lat&lng&category&radiusKm` — nearest online providers (haversine)
- `GET /bookings?userId=` — list bookings for a user
- `POST /bookings` — create booking, dispatch to nearest vendor via socket or queue fallback
- `PATCH /bookings/:id` — update booking status or rating
- `GET /profile/:userId` — get user profile
- `PUT /profile/:userId` — upsert user profile
- `POST /payments/intent` — create Stripe PaymentIntent (requires `STRIPE_SECRET_KEY`)

**Socket.IO** (path `/api/socket.io`):
- `join(userId)` — consumer joins their notification room
- `register-vendor(providerId)` — vendor goes online, stored in `vendorSockets`
- `NEW_LEAD` — emitted to vendor when a matching booking arrives
- `vendor:accept` — vendor accepts; server updates DB, notifies consumer
- `vendor:deny` — vendor denies; server queues auto-acceptance fallback

**In-memory queue** (`lib/queue.ts`):
- `vendor-assignment` — auto-accepts booking after 4 s (used when no vendor is live)
- `start-service` — transitions booking to `in_progress` after 3 s

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
