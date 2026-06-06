# Graph Report - .  (2026-06-05)

## Corpus Check
- 33 files · ~57,055 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 225 nodes · 285 edges · 19 communities (11 shown, 8 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Components & Utilities|UI Components & Utilities]]
- [[_COMMUNITY_Bug Fixes & Patches|Bug Fixes & Patches]]
- [[_COMMUNITY_Main Page & Preview Logic|Main Page & Preview Logic]]
- [[_COMMUNITY_Sonner & Theme Fixes|Sonner & Theme Fixes]]
- [[_COMMUNITY_Shadcn Component Config|Shadcn Component Config]]
- [[_COMMUNITY_README & Architecture Rationale|README & Architecture Rationale]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Dev Dependencies & Tooling|Dev Dependencies & Tooling]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Brand Assets & Icons|Brand Assets & Icons]]
- [[_COMMUNITY_App Layout & Fonts|App Layout & Fonts]]
- [[_COMMUNITY_API Route & GitHub Models|API Route & GitHub Models]]
- [[_COMMUNITY_Agent & Claude Instructions|Agent & Claude Instructions]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Code Display Rationale|Code Display Rationale]]
- [[_COMMUNITY_Logo SVG|Logo SVG]]
- [[_COMMUNITY_Dark Theme Rationale|Dark Theme Rationale]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 27 edges
2. `PixelForge Roadmap` - 19 edges
3. `PixelForge Application` - 17 edges
4. `compilerOptions` - 16 edges
5. `PixelForge Redesign & Repair Notes` - 11 edges
6. `Kimi K2 UI Enhancements Integration Review` - 10 edges
7. `PixelForge Hero Screenshot - Main UI` - 7 edges
8. `tailwind` - 6 edges
9. `aliases` - 6 edges
10. `Button()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Precision Instrument / Forge Design Thesis` --semantically_similar_to--> `Quality Bar (Identity, Speed, Dependencies)`  [INFERRED] [semantically similar]
  CHANGES.md → ROADMAP.md
- `shadcn/ui (radix-nova preset)` --conceptually_related_to--> `shadcn Token System Integration`  [INFERRED]
  README.md → CHANGES.md
- `Unused shadcn Primitives (input.tsx, textarea.tsx)` --conceptually_related_to--> `shadcn/ui (radix-nova preset)`  [INFERRED]
  FOLLOWUPS.md → README.md
- `Example Dashboard Screenshot - Sample Input Image` --rationale_for--> `PixelForge Hero Screenshot - Main UI`  [INFERRED]
  public/example.png → assets/hero.png
- `File Document Icon SVG` --conceptually_related_to--> `PixelForge Hero Screenshot - Main UI`  [INFERRED]
  public/file.svg → assets/hero.png

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Core Screenshot-to-Code Streaming Pipeline** — readme_upload_stage, readme_inference_stage, readme_streaming_stage, readme_render_stage [EXTRACTED 1.00]
- **UI Redesign and Bug Fix Bundle** — changes_pixelforge_redesign, changes_page_tsx, changes_route_ts, changes_globals_css [EXTRACTED 1.00]
- **Integration Review Code Quality Fixes** — integration_review_kimi_k2, integration_fix1_backtick_template, integration_fix3_useragentdata_type, integration_fix4_jsx_comment [EXTRACTED 1.00]
- **PixelForge UI Visual Assets** — assets_hero_ui_layout, assets_history_modal, assets_logo_brand [INFERRED 0.95]
- **Next.js and Vercel Deployment Branding Assets** — public_next_wordmark, public_vercel_logo [INFERRED 0.95]
- **UI Utility Icon Set** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.85]

## Communities (19 total, 8 thin omitted)

### Community 0 - "UI Components & Utilities"
Cohesion: 0.13
Nodes (20): cn(), Button(), buttonVariants, Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+12 more)

### Community 1 - "Bug Fixes & Patches"
Cohesion: 0.12
Nodes (25): AbortController Request Cancellation, Real Drag-and-Drop Handlers, Duplicate className on html Bug Fix, Broken Font Wiring Bug Fix, Object URL Leak Fix, Precision Instrument / Forge Design Thesis, Drafting Dot Grid and Hairline Rules, Ember on Warm Graphite Design Language (+17 more)

### Community 2 - "Main Page & Preview Logic"
Cohesion: 0.12
Nodes (16): createPreviewDoc(), DeviceWidth, formatBytes(), Framework, HistoryEntry, Home(), PreviewCanvas(), ShortcutItem (+8 more)

### Community 3 - "Sonner & Theme Fixes"
Cohesion: 0.11
Nodes (22): Sonner ThemeProvider Decoupling, components/ui/sonner.tsx, next-themes Unused Dependency, AI-Generated Screenshot Placeholder, Unused shadcn Primitives (input.tsx, textarea.tsx), Framework Toggle Tabs Context Issue, HTML or JSX Output Toggle, Session History (10 generations) (+14 more)

### Community 4 - "Shadcn Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 5 - "README & Architecture Rationale"
Cohesion: 0.11
Nodes (22): Device-Width Preview (desktop/tablet/mobile), GitHub Models Rationale (Free OpenAI-compatible endpoint), GPT-4o via GitHub Models, iframe with Tailwind Play CDN Rationale, Inference Stage (GPT-4o via GitHub Models), Keyboard-First Controls, Live Preview Sandboxed iframe, Live Token Streaming (+14 more)

### Community 6 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Dev Dependencies & Tooling"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, ai, @ai-sdk/openai, class-variance-authority, clsx, lucide-react, next, next-themes (+7 more)

### Community 9 - "Brand Assets & Icons"
Cohesion: 0.25
Nodes (9): PixelForge Hero Screenshot - Main UI, PixelForge History Modal UI Screenshot, PixelForge Logo SVG - Brand Identity, Example Dashboard Screenshot - Sample Input Image, File Document Icon SVG, Globe / Web Icon SVG, Next.js Wordmark SVG, Vercel Logo SVG - Triangle Logomark (+1 more)

### Community 10 - "App Layout & Fonts"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

## Knowledge Gaps
- **101 isolated node(s):** `github`, `geistSans`, `geistMono`, `metadata`, `Status` (+96 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PixelForge Application` connect `README & Architecture Rationale` to `Bug Fixes & Patches`, `Sonner & Theme Fixes`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `PixelForge Roadmap` connect `Sonner & Theme Fixes` to `Bug Fixes & Patches`, `README & Architecture Rationale`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `PixelForge Redesign & Repair Notes` connect `Bug Fixes & Patches` to `Sonner & Theme Fixes`, `README & Architecture Rationale`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `github`, `geistSans`, `geistMono` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Components & Utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.1349206349206349 - nodes in this community are weakly interconnected._
- **Should `Bug Fixes & Patches` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._
- **Should `Main Page & Preview Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.11594202898550725 - nodes in this community are weakly interconnected._