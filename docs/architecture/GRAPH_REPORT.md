# Graph Report - .  (2026-07-09)

## Corpus Check
- 73 files · ~108,348 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 519 nodes · 714 edges · 43 communities (27 shown, 16 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.85)
- Token cost: 0 input · 236,580 output

## Community Hubs (Navigation)
- Forge Workspace Page
- Roadmap and Changelog
- Design System and Legacy Assets
- Community Meta-Summary (nested)
- NPM Dependencies
- Instrument Design Rationale
- Forge Workspace UI Elements
- Landing and Docs Pages
- Workspace Components
- shadcn Component Config
- TypeScript Config
- API Route and Rate Limiting
- App Layered Architecture
- Forge and Steel Tokens
- Logo Visual Design
- Demo Screenshot Content
- History Drawer UI
- Landing and Layout Components
- Screenshot Capture Script
- Root Layout and Fonts
- Agent Config Imports
- Responsive Test Suite
- ESLint Config
- Next.js Config
- PostCSS Config
- Fidelity Prompt Feature
- Input Ergonomics Feature
- File Icon Asset
- Globe Icon Asset
- Next.js Logo Asset
- Vercel Logo Asset
- Window Icon Asset
- Vercel Deployment Note
- Error Recovery Feature
- Scroll Reveal Component
- Anchor Scroll Utility
- Scroll Reveal Hook

## God Nodes (most connected - your core abstractions)
1. `Graph Report for PixelForge (pre-redesign)` - 39 edges
2. `cn()` - 23 edges
3. `PixelForge Roadmap` - 18 edges
4. `PixelForge Redesign & Repair Notes` - 17 edges
5. `compilerOptions` - 16 edges
6. `Forge and Steel Design System` - 11 edges
7. `app/forge/page.tsx — forge workspace` - 11 edges
8. `Components layer (container)` - 11 edges
9. `Hero Image - PixelForge App Screenshot` - 10 edges
10. `Output Panel (Right): Generated Code/HTML Preview` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Screenshot-to-Code Streaming Pipeline (upload→base64→Gemini→stream→preview)` --semantically_similar_to--> `Pipeline: Upload Stage`  [INFERRED] [semantically similar]
  CHANGES.md → README.md
- `Precision Instrument / Forge Design Thesis` --semantically_similar_to--> `Quality Bar (applies to every roadmap item)`  [INFERRED] [semantically similar]
  CHANGES.md → ROADMAP.md
- `PixelForge Product Overview` --references--> `History Drawer Screenshot (assets/history.png)`  [EXTRACTED]
  README.md → assets/history.png
- `Architecture Diagram (assets/architecture.svg)` --conceptually_related_to--> `Generated Knowledge Graph Reference`  [INFERRED]
  assets/architecture.svg → README.md
- `Roadmap #6: Multi-framework output — HTML, React, Vue (mid term, not shipped)` --references--> `app/api/generate/route.ts — AI streaming endpoint`  [INFERRED]
  ROADMAP.md → app/api/generate/route.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **UI Redesign and Bug Fix Bundle** — changes_pixelforge_redesign, changes_page_tsx, changes_route_ts, changes_globals_css [EXTRACTED 1.00]
- **Integration Review Code Quality Fixes** — integration_review_kimi_k2, integration_fix1_backtick_template, integration_fix3_useragentdata_type, integration_fix4_jsx_comment [EXTRACTED 1.00]
- **Core Screenshot-to-Code Streaming Pipeline** — readme_upload_stage, readme_inference_stage, readme_streaming_stage, readme_render_stage [EXTRACTED 1.00]
- **Housekeeping Items Carried Forward from FOLLOWUPS.md** — followups_next_themes_unused, followups_input_textarea_unused, followups_screenshot_placeholder, roadmap_housekeeping [EXTRACTED 1.00]
- **Forge and Steel Design System Components** — design_color_system, design_typography_system, design_spacing_scale, design_radius_system, design_elevation_system, design_motion_rules, design_copy_rules [EXTRACTED 1.00]

## Communities (43 total, 16 thin omitted)

### Community 0 - "Forge Workspace Page"
Cohesion: 0.07
Nodes (46): Home(), formatTimestamp(), HistoryDrawer(), HistoryDrawerProps, PreviewCanvas(), PreviewCanvasProps, SHORTCUTS, ShortcutsDialog() (+38 more)

### Community 1 - "Roadmap and Changelog"
Cohesion: 0.05
Nodes (47): God Node: PixelForge Roadmap (17 edges), Historical: Cmd+H History Shortcut OS Collision Issue (per INTEGRATION_REVIEW.md), Changelog: History, Framework Toggle, Download, Device Preview, Shortcuts (2026/06), Changelog: History Persists Across Reloads (2026/06), Changelog: Refinement Loop (2026/06), Changelog: Shiki Syntax Highlighting (2026/06), components/CodePanel.tsx — code view, Feature: Device-Width Preview (mobile/tablet) (+39 more)

### Community 2 - "Design System and Legacy Assets"
Cohesion: 0.05
Nodes (46): Historical: Screenshot-to-Code Streaming Pipeline (per CHANGES.md, pre-redesign), Forge and Steel Color System (primitives + semantic mapping), shadcn Token Contract (semantic Tailwind names), Unused shadcn input/textarea Primitives, next-themes Unused Dependency, Placeholder Screenshot Asset (assets/screenshot.png), Acknowledgments Section, Architecture Diagram (assets/architecture.svg) (+38 more)

### Community 3 - "Community Meta-Summary (nested)"
Cohesion: 0.06
Nodes (41): Community: AI Generation API Route (thin), Community: App Layout and Fonts (cohesion 0.40, 3 nodes), Community: Brand and Design Tokens (cohesion 0.27, 11 nodes), Community: Demo Input Screenshot (cohesion 0.22, 11 nodes), Community: Design System and Change Log (cohesion 0.08, 30 nodes), Community: Dev Dependencies (cohesion 0.11, 17 nodes), Community: Docs and Architecture Reports (cohesion 0.07, 38 nodes), Community: ESLint Config (thin) (+33 more)

### Community 4 - "NPM Dependencies"
Cohesion: 0.06
Nodes (35): dependencies, ai, @ai-sdk/openai, class-variance-authority, clsx, lucide-react, next, radix-ui (+27 more)

### Community 5 - "Instrument Design Rationale"
Cohesion: 0.08
Nodes (30): AbortController Request Cancellation, Broken Font Wiring Bug Fix, Precision Instrument / Forge Design Thesis, Drafting Dot Grid and Hairline Rules, Real Drag-and-Drop Handlers (onDragOver/onDragLeave/onDrop), Duplicate className on html Bug Fix, Ember on Warm Graphite Design Language, Geist Mono Typography (+22 more)

### Community 6 - "Forge Workspace UI Elements"
Cohesion: 0.10
Nodes (29): Output Tab: Code, Copy Button (Output Panel), Dark Theme UI Design, File Size Metadata Display (4.9 KB), Forge Again Button (Output Panel), Forge Code CTA Button, Hero Headline: Drop a screenshot. Forge the markup., Hero Image - PixelForge App Screenshot (+21 more)

### Community 7 - "Landing and Docs Pages"
Cohesion: 0.13
Nodes (14): metadata, SECTIONS, FEATURES, Hero(), Process(), STEPS, Reveal(), RevealProps (+6 more)

### Community 8 - "Workspace Components"
Cohesion: 0.17
Nodes (16): CodePanel(), CodePanelProps, RefinementBar(), RefinementBarProps, UploadDropzone(), UploadDropzoneProps, LastAction, PixelForgeSource (+8 more)

### Community 9 - "shadcn Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 11 - "API Route and Rate Limiting"
Cohesion: 0.17
Nodes (15): github, POST(), Bucket, buckets, checkRateLimit(), clientKeyFromHeaders(), RateLimitResult, ALLOWED_MIME_TYPES (+7 more)

### Community 12 - "App Layered Architecture"
Cohesion: 0.14
Nodes (17): /api/generate (AI streaming endpoint), CodePanel, Components layer (container), HistoryDrawer, lib layer (container), app/page.tsx (thin composition layer), preview.ts, PreviewCanvas (+9 more)

### Community 13 - "Forge and Steel Tokens"
Cohesion: 0.17
Nodes (13): Historical: Precision Instrument / Forge Design Thesis (per CHANGES.md, pre-redesign), app/globals.css (CSS variable implementation of design tokens), Copy Rules (one CTA verb, no AI phrasing), Elevation System (two shadows + static glow), Forge and Steel Design System, Motion Rules (transform/opacity only), Radius System, the 9px Signature, Forge and Steel Spacing Scale (+5 more)

### Community 14 - "Logo Visual Design"
Cohesion: 0.27
Nodes (11): Logo Background Rectangle, Logo Border Stroke, Ordered Code Lines (Right Side), Dark Background Color #2A2724, Gray Pixel Color #8B8580, Light Text Color #F4EDE6, Orange Accent Color #E8843C, Raw-to-Structured Visual Metaphor (+3 more)

### Community 15 - "Demo Screenshot Content"
Cohesion: 0.22
Nodes (11): Analytics Platform Dashboard, Conversion Rate KPI Card, Date Range Filter Control, PixelForge Demo Input Image, Example PNG Demo Image, Revenue Over Time Line Chart, Orders KPI Card, Recent Orders Data Table (+3 more)

### Community 16 - "History Drawer UI"
Cohesion: 0.28
Nodes (9): Close Button, File Metadata (Size and Time), History Drawer, History Entry, Modal Overlay, PixelForge App, Restore Button, Screenshot Upload Area (+1 more)

### Community 17 - "Landing and Layout Components"
Cohesion: 0.29
Nodes (8): app/docs/page.tsx — getting-started guide, components/landing/Features.tsx, components/layout/Footer.tsx, components/landing/Hero.tsx, app/(marketing)/page.tsx — landing page, components/layout/Nav.tsx, components/landing/Process.tsx, components/landing/Specimens.tsx

### Community 18 - "Screenshot Capture Script"
Cohesion: 0.32
Nodes (7): ASSETS, __dirname, loadExample(), main(), ROOT, VIEWPORT, waitForServer()

### Community 19 - "Root Layout and Fonts"
Cohesion: 0.33
Nodes (4): bricolageGrotesque, inter, jetBrainsMono, metadata

### Community 20 - "Agent Config Imports"
Cohesion: 0.67
Nodes (3): Imported Claude Cowork Project Instructions (import point), Next.js Version-Specific Conventions Warning, CLAUDE.md Project Instructions (@AGENTS.md import)

## Knowledge Gaps
- **238 isolated node(s):** `github`, `metadata`, `SECTIONS`, `bricolageGrotesque`, `inter` (+233 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PixelForge Roadmap` connect `Roadmap and Changelog` to `Design System and Legacy Assets`, `Forge and Steel Tokens`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `Graph Report for PixelForge (pre-redesign)` connect `Community Meta-Summary (nested)` to `Roadmap and Changelog`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `God Node: PixelForge Roadmap (17 edges)` connect `Roadmap and Changelog` to `Community Meta-Summary (nested)`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `PixelForge Roadmap` (e.g. with `God Node: PixelForge Roadmap (17 edges)` and `README Roadmap Checklist (condensed)`) actually correct?**
  _`PixelForge Roadmap` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `github`, `metadata`, `SECTIONS` to the rest of the system?**
  _241 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Forge Workspace Page` be split into smaller, more focused modules?**
  _Cohesion score 0.07341269841269842 - nodes in this community are weakly interconnected._
- **Should `Roadmap and Changelog` be split into smaller, more focused modules?**
  _Cohesion score 0.0549645390070922 - nodes in this community are weakly interconnected._