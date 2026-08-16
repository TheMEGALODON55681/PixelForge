# Integration Review — Kimi K2 UI Enhancements

This document records the review of Kimi K2's work, the verification performed,
and the exact fixes applied during integration. It is the bridge between Kimi's
`Files Modified` summary and the final merged project.

## Verdict

Kimi's work is **high quality and faithful to the PRD**. All seven tasks were
implemented in the spirit they were specified, the design identity was respected
(no new accent colors, no glow blobs, no glass-morphism, no second font, no new
dependencies), and the trade-offs Kimi documented were reasonable.

However, the delivered code **did not compile or lint cleanly**. Four genuine
defects were found and fixed during integration. Per the instruction "check that
it works… change it if needed," these were not optional — the project would not
build without them.

## How it was verified

The current full project (with the real `components/ui/` shadcn primitives) was
used as the base, and Kimi's modified files (`app/page.tsx`,
`app/api/generate/route.ts`) plus new files (`public/example.png`,
`assets/screenshot.png`, `FOLLOWUPS.md`) were overlaid. Then:

1. `npm install` — 711 packages, succeeded.
2. `npx tsc --noEmit` — TypeScript strict type-check.
3. `npx eslint .` — the project's lint script.
4. `npx next build` — full production build.

The production build was confirmed to **compile successfully** (TypeScript
passed, all 5 routes generated, `/api/generate` registered as dynamic). The only
build failure in this sandbox was the `next/font` fetch of Geist/Geist Mono from
Google Fonts returning HTTP 403 — a sandbox network restriction, not a code
problem. It builds on any machine with normal internet. (This was proven by
temporarily stubbing the fonts, building successfully, then restoring the
original font-enabled `layout.tsx` byte-for-byte.)

## Fixes applied (the only changes to Kimi's code)

### Fix 1 — `route.ts` line 86: build-breaking backticks (CRITICAL)

Kimi's JSX rider contained:

    - Convert every `class` attribute to `className`.

The backticks around `class` and `className` were inside a JS template literal
(which is itself delimited by backticks), so they terminated the template string
early and produced three `TS1005` syntax errors. **The project did not compile.**

Fixed by using single quotes inside the template literal:

    - Convert every 'class' attribute to 'className'.

### Fix 2 — `route.ts` line 88: garbled escaping instruction

Kimi's text read:

    - Escape curly braces in text content: replace literal { with {{'{'{{ and literal } with {{'}'{{.

The `{{'{'{{` sequence is malformed — it is not valid guidance and no model
could follow it to produce correct JSX. Rewritten to a clear, correct
instruction:

    - Escape literal curly braces ... write a literal { as {'{'} and a literal } as {'}'} ...

(Not a compile error, but a content defect that would have produced broken JSX
output — the exact thing Task 2 was meant to get right.)

### Fix 3 — `page.tsx` line ~110: `navigator.userAgentData` type error (CRITICAL)

`navigator.userAgentData?.platform` fails TypeScript strict mode because
`userAgentData` is not yet in the TS DOM lib (`error TS2551`). **The project did
not type-check.** Fixed with a minimal local type narrowing (no `any`):

    const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;

Kimi's fallback logic (`navigator.platform` first, then `userAgentData`) is
preserved exactly.

### Fix 4 — `page.tsx` line ~1031: comment-in-JSX lint error

The empty `CodeView` placeholder rendered a literal `// markup will stream here`
as a JSX child, which ESLint flags as `react/jsx-no-comment-textnodes` (React
parses it as a stray comment node). Fixed by making it an explicit string:

    {"// markup will stream here"}

### Bonus — documented the one legitimate lint exception

The Mac-detection effect triggers `react-hooks/set-state-in-effect`. This is the
*correct* pattern here: the value depends on `navigator`, which is undefined
during SSR, so the component must render an SSR-safe default and correct it after
mount. The lint-rule alternative (a lazy initializer reading `navigator`) would
cause a hydration mismatch — strictly worse. A scoped
`// eslint-disable-next-line` with a full explanatory comment was added rather
than degrading the code to satisfy the linter.

## Issues noted but NOT changed (Kimi's design decisions, left intact)

These are observations for a future iteration, deliberately left as Kimi built
them because they are not defects and changing them would exceed the "fix what's
broken" mandate:

1. **Framework toggle nested in the Tabs context.** The HTML/JSX toggle uses
   `TabsTrigger` with manual `data-state`/`onClick` inside the same `<Tabs>` as
   Preview/Code. It compiles and works, but the HTML/JSX triggers register with
   the outer Tabs roving-focus group, so keyboard arrow navigation treats all
   four triggers as one group. A cleaner future refactor would make the
   framework toggle a plain button group (not `TabsTrigger`). Low priority —
   functionally fine via mouse/tap. Logged in FOLLOWUPS.md.

2. **`Ctrl+H` / `Cmd+H` shortcut.** On macOS `Cmd+H` is "Hide window" at the OS
   level and may not always be interceptable; in browsers `Ctrl+H` opens
   History. Kimi calls `preventDefault()`, which covers the browser case. Worth
   revisiting the choice of `H` in a future pass, but harmless as-is.

3. **History thumbnails share object URLs with the live preview.** When an entry
   is restored, its `imagePreview` URL becomes the active `objectUrlRef`. The
   unmount cleanup handles all URLs correctly, and eviction revokes only evicted
   entries, so there is no leak in normal use. An edge case (restore an entry,
   then immediately upload a new file) could revoke a URL a history entry still
   references, blanking that one thumbnail until reload. Minor, cosmetic, logged
   in FOLLOWUPS.md.

None of these affect the build, the core generate→preview→copy loop, or the
design integrity.

## Final state

- `npx tsc --noEmit` → clean
- `npx eslint .` → clean
- `npx next build` → compiles successfully (fonts fetch on your machine)
- Design identity preserved; no new dependencies; PRD honored.
