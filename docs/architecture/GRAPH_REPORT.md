# Graph Report - .  (2026-06-14)

## Corpus Check
- 45 files · ~84,734 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 325 nodes · 454 edges · 24 communities (15 shown, 9 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.89)
- Token cost: 14,450 input · 6,630 output

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Page and Output Components|UI Page and Output Components]]
- [[_COMMUNITY_Docs and Architecture Reports|Docs and Architecture Reports]]
- [[_COMMUNITY_Types, Utilities and Shortcuts|Types, Utilities and Shortcuts]]
- [[_COMMUNITY_Design System and Change Log|Design System and Change Log]]
- [[_COMMUNITY_Hero Screenshot UI|Hero Screenshot UI]]
- [[_COMMUNITY_Project Aliases and Config Schema|Project Aliases and Config Schema]]
- [[_COMMUNITY_TypeScript Compiler Config|TypeScript Compiler Config]]
- [[_COMMUNITY_Feature Roadmap and Reviews|Feature Roadmap and Reviews]]
- [[_COMMUNITY_Dev Dependencies|Dev Dependencies]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Brand and Design Tokens|Brand and Design Tokens]]
- [[_COMMUNITY_Demo Input Screenshot|Demo Input Screenshot]]
- [[_COMMUNITY_Graph Data Schema|Graph Data Schema]]
- [[_COMMUNITY_History Drawer UI|History Drawer UI]]
- [[_COMMUNITY_App Layout and Fonts|App Layout and Fonts]]
- [[_COMMUNITY_AI Generation API Route|AI Generation API Route]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_File Icon Asset|File Icon Asset]]
- [[_COMMUNITY_Globe Icon Asset|Globe Icon Asset]]
- [[_COMMUNITY_Next.js Logo Asset|Next.js Logo Asset]]
- [[_COMMUNITY_Vercel Logo Asset|Vercel Logo Asset]]
- [[_COMMUNITY_Window Icon Asset|Window Icon Asset]]

## God Nodes (most connected - your core abstractions)
1. `PixelForge Application` - 27 edges
2. `cn()` - 23 edges
3. `PixelForge Redesign & Repair Notes` - 18 edges
4. `PixelForge Roadmap` - 17 edges
5. `compilerOptions` - 16 edges
6. `Kimi K2 UI Enhancements Integration Review` - 10 edges
7. `Hero Image - PixelForge App Screenshot` - 10 edges
8. `Output Panel (Right): Generated Code/HTML Preview` - 10 edges
9. `Analytics Platform Dashboard` - 10 edges
10. `Navigation Bar` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Screenshot-to-Code Streaming Pipeline (upload→base64→GPT-4o→stream→preview)` --semantically_similar_to--> `Upload Stage (image validation, multipart form data)`  [INFERRED] [semantically similar]
  CHANGES.md → README.md
- `Precision Instrument / Forge Design Thesis` --semantically_similar_to--> `Quality Bar (Identity, Speed, Dependencies, Server)`  [INFERRED] [semantically similar]
  CHANGES.md → ROADMAP.md
- `shadcn/ui (radix-nova preset)` --conceptually_related_to--> `shadcn Token System Integration`  [INFERRED]
  README.md → CHANGES.md
- `AI-Generated Screenshot Placeholder (assets/screenshot.png)` --conceptually_related_to--> `PixelForge Application`  [INFERRED]
  FOLLOWUPS.md → README.md
- `Cmd+H History Shortcut OS Collision Issue` --conceptually_related_to--> `Roadmap: Cmd+H Remap (OS collision fix)`  [INFERRED]
  INTEGRATION_REVIEW.md → ROADMAP.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Core Screenshot-to-Code Streaming Pipeline** — readme_upload_stage, readme_inference_stage, readme_streaming_stage, readme_render_stage [EXTRACTED 1.00]
- **UI Redesign and Bug Fix Bundle** — changes_pixelforge_redesign, changes_page_tsx, changes_route_ts, changes_globals_css [EXTRACTED 1.00]
- **Integration Review Code Quality Fixes** — integration_review_kimi_k2, integration_fix1_backtick_template, integration_fix3_useragentdata_type, integration_fix4_jsx_comment [EXTRACTED 1.00]

## Communities (24 total, 9 thin omitted)

### Community 0 - "UI Page and Output Components"
Cohesion: 0.09
Nodes (26): Home(), CodePanel(), CodePanelProps, HistoryDrawer(), HistoryDrawerProps, PreviewCanvas(), PreviewCanvasProps, Toolbar() (+18 more)

### Community 1 - "Docs and Architecture Reports"
Cohesion: 0.07
Nodes (38): Next.js Agent Rules (AGENTS.md), Next.js Breaking Changes Warning, Interactive 3D Graph Viewer (vis-network), vis-network v9.1.6 (graph visualization library), Graph Report (graphify output for PixelForge), cn() Utility (27 edges - top god node), 19 Community Clusters (knowledge graph communities), God Nodes (most connected core abstractions) (+30 more)

### Community 2 - "Types, Utilities and Shortcuts"
Cohesion: 0.11
Nodes (25): SHORTCUTS, ShortcutsDialog(), ShortcutsDialogProps, ShortcutItem, cn(), Card(), CardAction(), CardContent() (+17 more)

### Community 3 - "Design System and Change Log"
Cohesion: 0.08
Nodes (30): Broken Font Wiring Bug Fix, Precision Instrument / Forge Design Thesis, Drafting Dot Grid and Hairline Rules, Real Drag-and-Drop Handlers (onDragOver/onDragLeave/onDrop), Duplicate className on html Bug Fix, Ember on Warm Graphite Design Language, Geist Mono Typography, app/globals.css (token identity, mono/sans wiring) (+22 more)

### Community 4 - "Hero Screenshot UI"
Cohesion: 0.10
Nodes (29): Output Tab: Code, Copy Button (Output Panel), Dark Theme UI Design, File Size Metadata Display (4.9 KB), Forge Again Button (Output Panel), Forge Code CTA Button, Hero Headline: Drop a screenshot. Forge the markup., Hero Image - PixelForge App Screenshot (+21 more)

### Community 5 - "Project Aliases and Config Schema"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 6 - "TypeScript Compiler Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Feature Roadmap and Reviews"
Cohesion: 0.14
Nodes (18): Framework Toggle Tabs Context Issue (keyboard roving-focus), HTML or JSX Output Toggle, Session History (10 generations), Roadmap: Accessibility Audit of Generated Output (axe-core), Roadmap: Accounts + Cloud History + Shareable Links, Roadmap: Batch / Sequence Mode (multi-screen flows), Roadmap: Cmd+H Remap (OS collision fix), Roadmap: Decouple Framework Toggle from Tabs Context (+10 more)

### Community 8 - "Dev Dependencies"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 9 - "Runtime Dependencies"
Cohesion: 0.14
Nodes (14): dependencies, ai, @ai-sdk/openai, class-variance-authority, clsx, lucide-react, next, radix-ui (+6 more)

### Community 10 - "Brand and Design Tokens"
Cohesion: 0.27
Nodes (11): Logo Background Rectangle, Logo Border Stroke, Ordered Code Lines (Right Side), Dark Background Color #2A2724, Gray Pixel Color #8B8580, Light Text Color #F4EDE6, Orange Accent Color #E8843C, Raw-to-Structured Visual Metaphor (+3 more)

### Community 11 - "Demo Input Screenshot"
Cohesion: 0.22
Nodes (11): Analytics Platform Dashboard, Conversion Rate KPI Card, Date Range Filter Control, PixelForge Demo Input Image, Example PNG Demo Image, Revenue Over Time Line Chart, Orders KPI Card, Recent Orders Data Table (+3 more)

### Community 12 - "Graph Data Schema"
Cohesion: 0.22
Nodes (8): built_at_commit, directed, graph, hyperedges, hyperedges, links, multigraph, nodes

### Community 13 - "History Drawer UI"
Cohesion: 0.28
Nodes (9): Close Button, File Metadata (Size and Time), History Drawer, History Entry, Modal Overlay, PixelForge App, Restore Button, Screenshot Upload Area (+1 more)

### Community 14 - "App Layout and Fonts"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

## Knowledge Gaps
- **145 isolated node(s):** `github`, `geistSans`, `geistMono`, `metadata`, `$schema` (+140 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PixelForge Application` connect `Docs and Architecture Reports` to `Feature Roadmap and Reviews`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `God Nodes (most connected core abstractions)` connect `Docs and Architecture Reports` to `Design System and Change Log`, `Feature Roadmap and Reviews`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `PixelForge Redesign & Repair Notes` connect `Design System and Change Log` to `Docs and Architecture Reports`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `github`, `geistSans`, `geistMono` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Page and Output Components` be split into smaller, more focused modules?**
  _Cohesion score 0.09371980676328502 - nodes in this community are weakly interconnected._
- **Should `Docs and Architecture Reports` be split into smaller, more focused modules?**
  _Cohesion score 0.06543385490753911 - nodes in this community are weakly interconnected._
- **Should `Types, Utilities and Shortcuts` be split into smaller, more focused modules?**
  _Cohesion score 0.10967741935483871 - nodes in this community are weakly interconnected._