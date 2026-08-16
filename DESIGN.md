# DESIGN.md: Forge and Steel

The design system of record for PixelForge. Values here are the source of truth; `app/globals.css` implements them as CSS variables mapped onto the existing shadcn token contract, so component code keeps using semantic names (`bg-card`, `text-muted-foreground`, `rounded-lg`) rather than raw values.

## Principle

Two reactions, nothing else matters: "this wasn't made by AI," and "someone put real effort into this." One accent. Sentence case headlines. Real content in every state.

## Color

### Primitives

| Token | Value |
|---|---|
| `orange-600` | `#E64A19` |
| `orange-700` | `#B23A13` |
| `paper-50` | `#FAF8F3` |
| `paper-100` | `#F1ECE0` |
| `paper-0` | `#FFFFFF` |
| `steel-900` | `#1B1C19` |
| `steel-700` | `#3A4250` |
| `steel-500` | `#6B7280` |
| `steel-300` | `#A8AEB8` |
| `steel-100` | `#E9ECF0` |
| `line-warm` | `#E4DECF` |
| `line-cool` | `#D5DAE1` |
| `code-ink-900` | `#121417` |
| `error-600` | `#BA1A1A` |

### Semantic mapping (shadcn contract → Forge and Steel)

| shadcn token | Value | Use |
|---|---|---|
| `background` | paper-50 | page canvas |
| `secondary` | paper-100 | headers, footers, control tracks |
| `card` / `popover` | paper-0 | cards, panels, dialogs |
| `muted` | steel-100 | structural / cool zone: preview panes |
| `border` / `input` | line-warm | dividers on paper |
| `foreground` / `card-foreground` | steel-900 | headlines, body |
| `muted-foreground` | steel-500 | metadata, labels |
| `primary` / `accent` | orange-600 | CTAs, active markers, links, ember. The only accent |
| `primary-foreground` / `accent-foreground` | paper-0 | text/icons on molten fill |
| `destructive` | error-600 | errors only, never a second orange |

Three brand-only tokens sit outside the shadcn contract: `--ember` (alias of the accent, used for fills, dots, borders, and the glow, non-text uses, which only need the 3:1 non-text contrast ratio), `--ember-strong` (orange-700, the same hue, used wherever the accent renders as small text on a paper background, orange-600 text fails the 4.5:1 AA text ratio at small sizes; orange-700 clears it at 5.6:1+), and `--rule` / `--rule-structural` (line-warm and line-cool respectively, used by `.pf-frame` and preview chrome). `--code-ink` (code-ink-900) is the one deliberately dark surface in an otherwise light app, the real syntax-highlighted output panel, matching a real editor rather than the page around it.

One accent rule: if a state needs a non-molten color, it uses `destructive` (error), never a second orange. `--ember-strong` is not a second accent, same hue, darker step, chosen for text legibility only.

## Typography

Three families, three roles, never crossed:

- **Bricolage Grotesque** (`--font-display`, exposed as `font-heading`), headlines only.
- **Inter** (`--font-body`, exposed as `font-sans`, the Tailwind default), body copy, UI text.
- **JetBrains Mono** (`--font-utility`, exposed as `font-mono`), eyebrows, micro labels, nav, button labels, status bar, code.

Headlines are sentence case, never all-caps. Only eyebrows, micro labels, button labels, and the status bar may be uppercase (`.pf-kicker` and similar utility classes apply `uppercase tracking-[…]` explicitly, it is never the default for a heading).

| Style | Family | Size / Line / Track | Weight | Use |
|---|---|---|---|---|
| `headline-xl` | Display | 47 / 1.02 / -0.035em | 800 | hero headline only |
| `headline-lg` | Display | 26 / 1.05 / -0.025em | 700 | section headers |
| `headline-md` | Display | 24 / 1.1 / -0.03em | 800 | card/panel titles |
| `headline-sm` | Display | 17 / 1.15 / -0.01em | 700 | list/spec titles |
| `wordmark` | Display | 19 / 1 / -0.02em | 800 | logo lockup only |
| `body-lg` | Body | 16 / 1.6 / 0 | 400 | marketing copy, prompt textarea |
| `body-md` | Body | 13 / 1.55 / 0 | 400 | UI descriptions |
| `body-sm` | Body | 11 / 1.4 / 0 | 500 | fine print |
| `eyebrow` | Utility | 11 / 1 / +0.18em | 500 | numbered section labels (uppercase) |
| `label-mono` | Utility | 10 / 1 / +0.16em | 700 | micro badges (uppercase) |
| `mono-ui` | Utility | 13 / 1.4 / +0.04em | 500 | nav items, quiet links |
| `mono-ui-strong` | Utility | 13 / 1 / +0.04em | 700 | button labels (uppercase) |
| `status-label` | Utility | 11 / 12 / +0.05em | 600 | status bar (uppercase) |
| `code-editor` | Utility | 13 / 1.5 / 0 | 400 | real output, sized for reading |

## Spacing

`xs 4` · `sm 8` · `md 16` (mobile gutter) · `lg 24` (desktop margin) · `xl 40` (section breaks) · `panel-gap 2` (forge input-to-result, deliberately tight).

## Radius, the 9px signature

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `radius-micro` | 4px | `rounded-sm` | badges |
| `radius-standard` | 6px | `rounded-md` | secondary buttons, inputs |
| `radius-forge` | 9px | `rounded-lg` | primary CTA, app shell, the signature |
| `radius-panel` | 12px | `rounded-xl` | cards, result panel |
| `radius-shell` | 14px | `rounded-2xl` | outermost container |
| `radius-full` | 9999px | `rounded-full` | pills, active segment |

Nested corners run 2-4px tighter than their parent so corners stay concentric (e.g. a `radius-panel` card holding a `radius-forge` button).

## Elevation

Exactly two shadows, plus one static glow. Nothing else does hierarchy work.

- `shadow-resting`: `0 1px 2px rgba(27,28,25,0.04)`
- `shadow-active`: `0 2px 4px rgba(27,28,25,0.06)`
- `glow-ember` (static, set once, never animated): `0 0 12px rgba(230,74,25,0.4)`

## Motion

Transform and opacity only. Never animate `top`, `left`, `width`, `height`, or `box-shadow`. No `filter: blur()`, animated or static. `prefers-reduced-motion: reduce` collapses the landing scroll-reveal to a plain opacity fade, no rotation, no offset.

## Copy rules

One CTA verb: **FORGE**. Never STRIKE, never GENERATE as a UI action label. No pricing anywhere. No em-dashes. No AI-sounding phrasing.
