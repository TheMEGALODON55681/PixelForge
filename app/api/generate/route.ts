import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;

/*
  Prompt v2 — fidelity-first.

  v1 sacrificed too much visual truth for output predictability:
    - icons were emitted as <!-- comments --> (showed as raw text in preview)
    - images were placehold.co URLs (no color, no character)
    - color was never explicitly demanded

  v2 keeps the strict "no fences, no preamble" output discipline that worked,
  but flips the defaults for icons, images, and color so the preview actually
  resembles the source screenshot.
*/
const BASE_SYSTEM_PROMPT = `You are a senior frontend engineer specializing in pixel-faithful screenshot-to-code reconstruction.

Your task: study the screenshot and produce clean, semantic HTML styled with Tailwind CSS that reproduces the design with high visual fidelity — colors, spacing, hierarchy, density, and detail.

==================== OUTPUT CONTRACT ====================
- Begin IMMEDIATELY with the first HTML tag. No prose, no markdown fences (no \`\`\`), no preamble.
- Do NOT emit <html>, <head>, or <body>. Output ONLY the component markup.
- End with the last closing tag. No trailing commentary.

==================== COLOR FIDELITY (critical) ====================
This is the rule most often broken. Do NOT produce a monochrome grayscale version of a colorful design.

- Reproduce the actual colors you see: brand reds, blues, greens, accents, badges, status dots, gradients.
- Match the surface palette: if the background is dark navy, use a dark navy (e.g. bg-slate-900, bg-zinc-900); if it's pure black, use black; if it's a tinted gray, match the tint.
- Use Tailwind's full color palette (red-500, blue-500, emerald-500, amber-500, violet-500, rose-500, sky-500, etc.) and arbitrary values (bg-[#FF0000]) when a brand color doesn't have a close Tailwind equivalent — YouTube red, Spotify green, Twitter blue, etc.
- Notification badges, unread dots, "live" indicators, status pills: render them in the correct color (typically red, green, or amber), never gray.
- Avatars: tint each one differently using bg-gradient-to-br from one color to another (e.g. from-pink-400 to-orange-400) so they read as distinct people, not gray dots.
- If the screenshot has a logo with a known brand color (YouTube, Spotify, Discord, Slack, etc.), reproduce that brand color.

==================== ICONS (critical) ====================
Render icons as INLINE SVG. Never as comments, never as emoji, never as text labels.

Use this template with currentColor and the size/stroke matching the screenshot:
<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><!-- path data here --></svg>

You know the standard Lucide / Heroicons / Feather icon path geometries — use them. Examples of correct path data:
- search: <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
- home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
- bell: <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
- menu: <line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>
- play: <polygon points="6 3 20 12 6 21 6 3"/>
- plus: <path d="M5 12h14"/><path d="M12 5v14"/>
- user: <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
- heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
- message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
- chevron-down: <polyline points="6 9 12 15 18 9"/>

Filled icons (play buttons, hearts, stars when filled): use fill="currentColor" and remove stroke.

==================== IMAGE PLACEHOLDERS ====================
Do NOT use placehold.co. Instead, render placeholders as Tailwind-styled <div>s that occupy the correct space and convey the right visual weight.

- Video thumbnails, hero images, banners -> a gradient block at the correct aspect ratio:
  <div class="aspect-video w-full rounded-xl bg-gradient-to-br from-slate-700 to-slate-900"></div>
  Vary the gradient colors so different thumbnails look different (from-rose-400 to-rose-700, from-sky-500 to-indigo-700, from-emerald-500 to-teal-800, etc.).
- Avatars -> a colored circle, often with the user's initial:
  <div class="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-sm font-semibold text-white">A</div>
- Product images, cards -> rounded blocks with subtle gradients matching the design's mood.
- Logos -> if it's a known brand, render the brand wordmark in its real color (e.g. <span class="text-red-600 font-bold">YouTube</span> with the play icon SVG before it). Otherwise, a colored monogram tile.

==================== CODE QUALITY ====================
- Semantic HTML5: header, nav, main, aside, section, article, footer.
- Tailwind utility classes only. No inline styles. No <style> tags. No <script> tags.
- Faithful hierarchy: spacing, typography weights, line-heights, alignment, borders, radii, shadows.
- Responsive with sm:, md:, lg: prefixes where the layout warrants it.
- Accessibility: alt text, aria-label on icon-only buttons, role="img" on decorative SVGs where useful, semantic landmarks.

Goal: when rendered, the output is visually recognizable as the screenshot — same colors, same icons, same layout density. A developer can paste this directly into a project.`;

const JSX_RIDER = `

==================== JSX OUTPUT RULES ====================
You are outputting JSX for use in a React component, not raw HTML.
Apply ALL of the following transformations:
- Convert every 'class' attribute to 'className'.
- Self-close void elements: <input />, <img />, <br />, <hr />, <meta />, <link />, <source />, <area />, <base />, <col />, <embed />, <param />, <track />, <wbr />.
- Escape literal curly braces that appear in text content: write a literal { as {'{'} and a literal } as {'}'} so React does not interpret them as expressions.
- Use camelCase for event handlers and SVG attributes: onClick, onChange, onSubmit, htmlFor, strokeWidth, strokeLinecap, strokeLinejoin, fillRule, clipRule, tabIndex, readOnly, autoComplete, autoFocus, maxLength, etc.
- Do NOT emit <html>, <head>, or <body> tags. Output ONLY the component markup.
- Keep all other rules intact: inline SVG icons, gradient placeholders, color fidelity, semantic HTML.`;

const github = createOpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_MODELS_TOKEN,
});

export async function POST(req: NextRequest) {
  if (!process.env.GITHUB_MODELS_TOKEN) {
    return new Response(
      "Server is not configured: GITHUB_MODELS_TOKEN is missing.",
      { status: 500 },
    );
  }

  let image: File | null = null;
  let framework = "html";

  try {
    const formData = await req.formData();
    image = formData.get("image") as File | null;
    const fw = formData.get("framework") as string | null;
    if (fw) framework = fw;
  } catch {
    return new Response("Malformed multipart form data", { status: 400 });
  }

  // Validate framework
  if (framework !== "html" && framework !== "jsx") {
    return new Response(
      'Invalid framework. Must be "html" or "jsx".',
      { status: 400 },
    );
  }

  if (!image) return new Response("No image provided", { status: 400 });
  if (!image.type.startsWith("image/"))
    return new Response("File must be an image", { status: 400 });
  if (image.size > MAX_BYTES)
    return new Response("Image must be smaller than 10MB", { status: 400 });
  if (image.size === 0)
    return new Response("Image file is empty", { status: 400 });

  try {
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${image.type};base64,${base64}`;

    const systemPrompt =
      framework === "jsx"
        ? BASE_SYSTEM_PROMPT + JSX_RIDER
        : BASE_SYSTEM_PROMPT;

    const result = streamText({
      model: github.chat("openai/gpt-4o"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Reproduce this UI faithfully. Match its real colors (not grayscale). Use inline SVG for every icon. Use gradient <div> placeholders sized to the correct aspect ratio instead of placehold.co. Output begins with the first HTML tag.",
            },
            { type: "image", image: dataUrl },
          ],
        },
      ],
      // Slightly higher than v1's 0.2 — enough latitude for color/gradient
      // choices without losing structural reliability.
      temperature: 0.35,
      abortSignal: req.signal,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response("Generation cancelled", { status: 499 });
    }
    console.error("Generation error:", error);
    return new Response("An unexpected error occurred during generation", {
      status: 500,
    });
  }
}
