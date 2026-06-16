# PixelForge — Roadmap

PixelForge is not "done." It does one thing — turn a screenshot into code — and
the bar is to do that one thing better than anything else, then keep raising the
bar. This document is the standing list of where it goes next. It is ordered by
horizon, and within each horizon by leverage (impact per unit of effort and
risk). Nothing here should compromise the two things that make the product what
it is: the **ember-on-graphite instrument identity** and the **clean
generate → preview → copy loop**.

Each item answers one question: *does this make the core thing better, or is it
decoration?* Decoration is rejected.

---

## Near term — sharpen what exists (next 1–2 iterations)

These finish the current feature set and remove the small rough edges noted
during integration. High confidence, low risk.

### 1. Decouple the framework toggle from the Tabs context ✅ Shipped
**Shipped.** The HTML/JSX toggle now has its own nested `<Tabs>` root in
`Toolbar.tsx`, separate from the Preview/Code `Tabs` root — simpler than the
proposed standalone button group, and the radix-nova `TabsList` styling comes
for free. This turned out to be more than a keyboard-focus quirk: sharing one
root meant clicking JSX silently blanked the Preview/Code panel, since Radix
only renders content for the active tab's `value` and "jsx" matched neither.

### 2. Persist history and preferences across reloads ⚠️ Partially shipped
**Shipped (history only).** The last 10 generations persist across reloads —
`useHistory.ts`, keyed `pixelforge:history:v1` in `localStorage`. Simpler than
the proposed IndexedDB approach: thumbnails are downscaled to JPEG data URLs
up front, so there's no blob to manage and plain `localStorage` is enough.
The other half of this item never landed — framework and device-width
preference still reset to their defaults on every reload.

### 3. Syntax highlighting in the Code view ✅ Shipped
**Shipped.** Shiki, dynamically imported as a singleton in `lib/highlight.ts`
and applied in `CodePanel.tsx` once `status === 'ready'` — plain text while
streaming, themed to `github-dark` with the background overridden to match
the panel. One correction to the original framing: this isn't zero-runtime-JS.
The highlighter and grammars are real client-side JS, just lazy-loaded on
first use instead of bundled upfront — confirmed via a production build that
nothing Shiki-related loads until a generation actually reaches Ready.

### 4. "Copy" → richer export menu
**Why.** Copy and Download exist separately. Power users want options.
**What.** A small split-button: Copy code · Copy as full HTML doc · Download ·
Open in new tab (renders the preview standalone). All client-side, no new deps.
**Effort.** S. **Risk.** Low.

### 5. Cmd+H reconsideration + shortcut polish
**Why.** `Cmd+H` collides with macOS "Hide window."
**What.** Remap history to a non-colliding chord (e.g. `Cmd+Y` or `Cmd+Shift+H`)
and surface the change in the shortcuts panel.
**Effort.** S. **Risk.** Low.

---

## Mid term — widen the product (next 3–6 iterations)

These add genuine capability. Each one is a reason for someone to choose
PixelForge over a generic "screenshot to code" prompt.

### 6. Multi-framework output: React+Tailwind, HTML, and Vue
**Why.** JSX was the first step. The real value is "give me this UI in *my*
stack." This is the single highest-leverage expansion of the core.
**What.** Extend the framework toggle to: HTML, React (JSX/TSX), Vue SFC. The
server prompt already has a rider pattern — add riders per target. Consider a
"component vs. page" switch too.
**Effort.** M–L. **Risk.** Medium (prompt quality per target must be validated).

### 7. Refinement loop ("nudge the output") ✅ Shipped
**Shipped.** A `RefinementBar` below the output, gated on `status === 'ready'`,
re-calls `/api/generate` in a new `refine` mode with the current code, the
instruction, and the original screenshot (toggleable, on by default) instead
of a fresh roll. Each revision streams in as a full document, never a diff,
and lands in history exactly like a forge does — so item 2's persistence
covers it with no extra work. Retry (new, see error-handling work) replays a
failed refinement rather than falling back to a fresh forge.

### 8. Element-level inspection / partial regeneration
**Why.** Sometimes only one section is wrong. Regenerating everything is wasteful.
**What.** Let the user draw a box on the source screenshot (or click a rendered
region) and regenerate just that fragment. Hard but distinctive.
**Effort.** L. **Risk.** High (UX and prompt complexity). A "wow" feature if done
well; defer until 6 and 7 are solid.

### 9. Model choice + quality/speed toggle
**Why.** GitHub Models offers more than GPT-4o. Users may want a faster cheaper
pass or a higher-fidelity slower one.
**What.** A small model selector (e.g. GPT-4o vs a stronger vision model as they
become available on the provider). Surface a "draft / refined" toggle that maps
to temperature + model. Keep GPT-4o the default.
**Effort.** S–M. **Risk.** Low–Medium (validate each model's prompt adherence).

### 10. Accessibility + responsiveness audit of *generated* output
**Why.** PixelForge already asks the model for a11y (alt text, aria-labels). A
differentiator is *verifying* it: run the generated HTML through an automated
checker and show a small score ("a11y: 9 landmarks, 2 missing alt").
**What.** Lightweight client-side pass (axe-core in the iframe) reporting issues.
Optionally feed findings back into a refinement (ties into item 7).
**Effort.** M. **Risk.** Medium.

---

## Long term — make it a platform (6+ iterations out)

Bigger bets. Each needs its own PRD; listed here so the direction is on record.

### 11. Accounts + cloud history + shareable links
**Why.** "Send someone a link to this generation" is a natural growth loop.
**What.** Optional auth, server-side persistence, a public read-only share URL
for a generation (source thumbnail + code + preview). This is the first item
that touches the backend meaningfully — scope carefully, keep the no-account
path fully functional.
**Effort.** L. **Risk.** High (auth, storage, privacy, abuse).

### 12. Design-system-aware generation
**Why.** Teams want output in *their* component library, not raw Tailwind.
**What.** Let a user upload or connect a component manifest (shadcn, MUI, their
own) and have the model emit code using those components. Extremely valuable to
real teams; extremely hard to do well.
**Effort.** XL. **Risk.** High.

### 13. Figma / image-URL / live-URL ingestion
**Why.** Screenshots are one input. "Paste a Figma frame" or "point at a live
site" widens the funnel.
**What.** Additional source adapters feeding the same pipeline. Figma via its
API; live URL via a server-side screenshot. Respect copyright and robots.
**Effort.** L per adapter. **Risk.** Medium–High.

### 14. Batch / sequence mode
**Why.** Designers have *flows*, not single screens.
**What.** Upload several screenshots; generate a small multi-page/multi-component
set with shared styling extracted across them.
**Effort.** XL. **Risk.** High.

---

## Quality bar — applies to every item above

- **Identity is non-negotiable.** Ember-on-graphite, hairline rules, mono
  labels, corner ticks. No glow blobs, no glass-morphism as a primary device, no
  second font, no indigo/purple accents, no emoji in UI copy, no marketing tone.
- **The core loop stays fast.** No feature may slow or clutter
  upload → forge → preview → copy. New capability lives at the edges.
- **Dependencies are earned.** Each new package is justified in its PR. The
  current set is deliberately small.
- **Server changes are surgical.** The streaming contract and the
  fidelity-tuned system prompt are assets. Touch them only with intent.
- **Accessibility and responsiveness are features, not afterthoughts** — for both
  the PixelForge UI and the code it generates.

---

## Housekeeping (carried from FOLLOWUPS.md)

- Remove `next-themes` (installed, unused — the redesign decoupled sonner from it).
- ~~Decide on `input.tsx` / `textarea.tsx` (unused now; item 7 will need an
  input — keep them).~~ Resolved: both were removed in a prior cleanup before
  item 7 shipped. `RefinementBar.tsx` uses a plain styled `<input>` instead of
  reintroducing either primitive.
- Replace `assets/screenshot.png` / `public/example.png` with a real product
  screenshot when one is available (current one is a generic AI-generated
  dashboard — fine as a placeholder).
