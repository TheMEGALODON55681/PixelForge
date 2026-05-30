import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const SYSTEM_PROMPT = `You are an expert frontend developer specializing in converting UI screenshots into production-ready code.

Your task: analyze the provided screenshot and generate clean, semantic HTML styled with Tailwind CSS that recreates the design as faithfully as possible.

CRITICAL OUTPUT RULES:
- Start your response IMMEDIATELY with the HTML tag. NO markdown code fences (no \`\`\`html, no \`\`\`). NO preamble. NO explanations.
- Do not include <html>, <head>, or <body> tags — output only the component markup.
- End your response with the closing HTML tag. NO trailing commentary.

Code requirements:
- Use semantic HTML5 elements (header, nav, main, section, article, aside, footer) where appropriate.
- Use Tailwind CSS utility classes exclusively. No inline styles. No <style> tags.
- Match the visual hierarchy faithfully: spacing, typography, colors, alignment, borders.
- Replace images with https://placehold.co/[width]x[height] URLs.
- For icons, use Lucide icon names inside HTML comments (e.g., <!-- icon: search -->).
- Make the layout responsive with breakpoint prefixes (sm:, md:, lg:, xl:).
- Include accessibility: alt text, aria-labels on icon buttons, semantic landmarks.

Goal: a developer should be able to paste your output directly into a React project and have it render correctly.`;

const github = createOpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_MODELS_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;

    if (!image) return new Response("No image provided", { status: 400 });
    if (!image.type.startsWith("image/")) return new Response("File must be an image", { status: 400 });
    if (image.size > 10 * 1024 * 1024) return new Response("Image must be smaller than 10MB", { status: 400 });

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${image.type};base64,${base64}`;

    const result = streamText({
      model: github.chat("openai/gpt-4o"),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Generate HTML + Tailwind code for this UI:" },
            { type: "image", image: dataUrl },
          ],
        },
      ],
      temperature: 0.2,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Generation error:", error);
    return new Response("An unexpected error occurred", { status: 500 });
  }
}