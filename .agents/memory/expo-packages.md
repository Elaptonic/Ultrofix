---
name: Expo package availability in urban-app
description: Which expo packages are/aren't installed — avoid importing missing ones
---

**Not installed:**
- `expo-clipboard` — not in `artifacts/urban-app/node_modules`. Do not import it. Use React state (`useState`) to simulate copy feedback (set a "copied" state, reset after 2s).

**Why:** The package was never added to the workspace. Adding it requires `pnpm --filter @workspace/urban-app add expo-clipboard` + an Expo prebuild step on native.

**How to apply:**
- For copy-to-clipboard UX, maintain a `copiedCode` state and clear it with `setTimeout`. Show a checkmark icon while the state is set.
- Before using any `expo-*` package in a new screen, verify it exists: `ls artifacts/urban-app/node_modules/<package>`.
