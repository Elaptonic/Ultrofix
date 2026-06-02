---
name: Zod import in API server
description: How to use zod-style validation in the API server (esbuild bundler restriction)
---

The API server is bundled with esbuild. The path `"zod/v4"` cannot be resolved by it — using `import { z } from "zod/v4"` causes a build failure.

**Rule:** Do not import from `"zod/v4"` in any file under `artifacts/api-server/src/`. 

**Why:** The esbuild bundler (`artifacts/api-server/build.mjs`) cannot resolve the `zod/v4` sub-path export. No other route file in the project uses zod directly.

**How to apply:**
- For simple validation in API routes, use inline `Number.isInteger()` / `typeof` checks.
- If structured validation is needed, use `@workspace/api-zod` (already a dependency of the API server) which exposes pre-generated Zod schemas for the shared types.
- The DB package (`lib/db`) CAN use `zod/v4` — it's not bundled with esbuild.
