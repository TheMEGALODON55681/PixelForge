import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert frontend developer specializing in converting UI screenshots into production-ready code.

Your task: analyze the provided screenshot and generate clean, semantic HTML styled with Tailwind CSS that recreates the design as faithfully as possible.

Output requirements:
- Return ONLY the HTML code. No markdown code fences, no explanations, no commentary before or after.
- Do not include <html>, <head>, or <body> tags — output only the component markup.
- Use semantic HTML5 elements (header, nav, main, section, article, aside, footer) where appropriate.
- Use Tailwind CSS utility classes exclusively for styling. No inline styles. No <style> tags.
- Match the visual hierarchy faithfully: spacing, typography sizes, colors, alignment, borders.
- Replace any images in the screenshot with https://placehold.co/[width]x[height] URLs.
- For icons, use Lucide icon names inside HTML comments (e.g., <!-- icon: search -->).
- Make the layout responsive with appropriate breakpoint prefixes (sm:, md:, lg:, xl:).
- Include accessibility: alt text on images, aria-labels on icon-only buttons, semantic landmarks.
- Use realistic placeholder text only where the screenshot's text is unreadable. Otherwise, transcribe what you see.

Goal: a developer should be able to paste your output directly into a Next.js or React project and have it render correctly.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be smaller than 10MB" }, { status: 400 });
    }

    const token = process.env.GITHUB_MODELS_TOKEN;
    if (!token) {
      console.error("GITHUB_MODELS_TOKEN is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Convert image to base64 data URL for inline transmission to the model
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${image.type};base64,${base64}`;

    const response = await fetch(
      "https://models.github.ai/inference/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: "Generate HTML + Tailwind code for this UI:" },
                { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
              ],
            },
          ],
          max_tokens: 4096,
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub Models API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Code generation failed. Please try again." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const code = data.choices?.[0]?.message?.content;

    if (!code) {
      return NextResponse.json(
        { error: "No code was generated. Try a clearer screenshot." },
        { status: 500 }
      );
    }

    return NextResponse.json({ code });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
