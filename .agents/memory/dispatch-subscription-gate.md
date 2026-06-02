---
name: Dispatch subscription gate
description: Vendor dispatch now requires an active subscription — impacts new provider onboarding flow
---

`getRankedProviders` in `lib/db/src/matcher.ts` queries `vendor_subscriptions` and filters out any provider without an active, non-expired subscription before building the dispatch candidate list.

**Rule:** A provider with no subscription record (including brand-new providers) will never receive leads from the dispatch engine.

**Why:** Task #17 added a ₹999/month Pro Subscription gate. Leads only go to subscribed vendors.

**How to apply:**
- New vendor onboarding flow should redirect to `/vendor/subscribe` after completing `/vendor/onboarding`.
- When testing dispatch in dev/test environments, seed a `vendor_subscriptions` row (status='active', expiresAt > now) for any test provider, or the dispatch queue will always return empty.
- The subscription activate endpoint is `POST /api/subscriptions/activate` (authenticated, provider role required).
