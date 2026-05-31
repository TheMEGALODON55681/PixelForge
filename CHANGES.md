# PixelForge — redesign & repair notes

This bundle changes a small number of files with high intent rather than touching
everything. The pipeline (upload → base64 → GPT-4o via GitHub Models → streamed
text → sandboxed iframe preview) is preserved exactly. Dependencies, the API
contract, the model, and the deployment story are unchanged.

## Design thesis

The original UI was the default "AI SaaS" look: black background, blurred
indigo/cyan glows, gradient-clipped headline, a "Powered by…" pill, two mirror
glass cards. It was competent but anonymous.

The product translates raw pixels into ordered code. So the redesign treats the
interface as a **precision instrument / forge**, not a marketing page:

- A quiet **drafting-dot grid** and **hairline rules with corner registration
  ticks** instead of blurred gradient glows.
- **Geist Mono** (previously loaded but unused) carries the system's voice —
  kicker labels, status, file metadata, and live byte/line telemetry — the
  signal of a real developer tool.
- An intentional, on-concept accent: **ember on warm graphite**. "Forge" is heat
  and metal; the ember accent is deliberately not the default indigo, and the
  white preview reads like an artboard mounted on a dark workbench.
- One coherent **console** (a narrow Source rail + a dominant Output workspace)
  with a live status bar: Idle → Forging → Ready.

## Functional bugs fixed (these were real defects)

- **Duplicate `className` on `<html>`** in `layout.tsx` — JSX kept the last one,
  so `"dark"` was silently dropped. Now a single, correct className.
- **Broken font wiring** — `globals.css` declared `--font-sans: var(--font-sans)`
  (self-referential), so Geist Sans was downloaded but never applied. Now mapped
  to the `--font-geist-sans` variable that `layout.tsx` actually exposes.
- **`sonner` depended on a `ThemeProvider` that was never mounted**, so
  `useTheme()` always resolved to `"system"`. The toaster is now an explicit
  single-theme component. (Consequence: `next-themes` is now unused and can be
  removed from `package.json`.)
- **Dropzone advertised drag-and-drop but implemented none.** Real `onDragOver` /
  `onDragLeave` / `onDrop` handlers added.
- **Object URLs leaked** on every re-upload and on unmount. Now revoked.
- **No request cancellation** — re-submitting or navigating away left the stream
  running. An `AbortController` now cancels in-flight work on both client and
  server (`abortSignal: req.signal`).
- **README referenced `assets/logo.svg` and `assets/architecture.png` that did
  not exist.** Added an on-brand `assets/logo.svg`; removed the broken
  architecture image reference.

## The core maintainability fix

The page hardcoded `bg-zinc-950 / zinc-800 / zinc-900` everywhere and ignored the
full shadcn token system defined in `globals.css`. Two conflicting design systems
meant the tokens were dead weight and the UI was unmaintainable. Everything is
now routed through the tokens (`bg-background`, `text-foreground`, `bg-card`,
`text-primary`, `border-rule`, …). The shadcn primitives — which already used
tokens — finally look coherent without modification.

To remove an entire class of "dark mode didn't apply" bugs, the canonical
instrument palette lives in `:root` (not only under `.dark`), with `.dark`
mirroring it. The theme is correct regardless of the `html` class.

## Robustness added to the route handler

- `runtime = "nodejs"` (Buffer is required) and `maxDuration = 60` so long vision
  generations aren't cut off by a default function timeout.
- A fast, clear failure when `GITHUB_MODELS_TOKEN` is missing, instead of an
  opaque upstream 401.
- Tighter validation (empty file, malformed form data) and clearer messages.

## New, genuinely useful capability

**Paste a screenshot** (⌘/Ctrl+V anywhere) — the way screenshots are actually
captured — plus working drag-and-drop. Low-risk, on-purpose, not trend-chasing.

## Files in this bundle

- `app/globals.css` — new token identity, mono/sans wiring, instrument utilities
- `app/layout.tsx` — className/font fix, sharper metadata
- `app/page.tsx` — ground-up redesign (drag/paste, abort, telemetry, line numbers)
- `app/api/generate/route.ts` — hardened handler (same model/provider/stream)
- `components/ui/sonner.tsx` — decoupled from next-themes
- `assets/logo.svg` — new brand mark
- `README.md` — broken-image repair

## Verify locally

I could not run a production build here: this bundle ships without
`node_modules`, and `next/font/google` fetches Geist from Google Fonts at build
time, which the sandbox can't reach. All TS/TSX files were syntax-checked. Run:

    npm install
    npm run lint
    npm run build
    npm run dev

Suggested optional cleanup after verifying: remove `next-themes` from
`package.json` (now unused), and delete the unused `input.tsx` / `textarea.tsx`
primitives if you don't plan to use them.
