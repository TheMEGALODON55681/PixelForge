import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Docs, PixelForge',
  description: 'How to get from a screenshot to working code with PixelForge.',
};

const SECTIONS = [
  {
    num: '01',
    title: 'Upload a screenshot',
    body: `Open the forge workspace and drop, paste, or click to upload a PNG, JPG, or WEBP up to 10MB. Press Ctrl+V (Cmd+V on macOS) anywhere on the page to paste an image straight from your clipboard, or click "Try with an example" to forge a sample screenshot without uploading your own.\n\nBefore the forge starts, pick HTML or JSX from the framework toggle. This changes the shape of the output: HTML forges a static page with Tailwind classes, JSX forges a React component.`,
  },
  {
    num: '02',
    title: 'Forge and watch it stream',
    body: `Press Forge. The output panel streams the generated markup line by line as GPT-4o reads the screenshot, and the Preview tab renders the result live in a sandboxed frame the moment there is enough markup to show. Switch to the Code tab any time to read the raw, syntax-highlighted output.\n\nUse the device-width buttons to check the layout at desktop, tablet (768px), and mobile (375px) without leaving the page.`,
  },
  {
    num: '03',
    title: 'Refine, retry, and keep your work',
    body: `Once a generation is ready, describe a change in the Refine bar below the output, for example "make the header sticky" or one of the suggested edits. PixelForge reads the current code (and the original screenshot, if you leave that toggle on) and updates the output in place, rather than starting over.\n\nForge again repeats the last action exactly. Copy or download the result with the correct file extension for the active framework. Every completed generation is saved to the history drawer with a thumbnail, up to the last ten, and survives a page reload.`,
  },
];

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="pf-kicker mb-3 text-ember-strong">Docs</p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Getting started with PixelForge
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            PixelForge turns a UI screenshot into clean, semantic HTML or JSX with Tailwind. This
            guide covers the forge workflow end to end, from a first upload to a refined,
            downloaded result.
          </p>

          <div className="mt-12 flex flex-col gap-8">
            {SECTIONS.map((section) => (
              <div key={section.num} className="rounded-xl border border-rule bg-card p-6 shadow-[0_1px_2px_rgba(27,28,25,0.04)]">
                <p className="pf-kicker mb-3 text-ember-strong">{section.num}</p>
                <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
                  {section.title}
                </h2>
                {section.body.split('\n\n').map((para, i) => (
                  <p key={i} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {para}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <Link
            href="/forge"
            className="mt-12 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-mono text-[0.8rem] font-bold uppercase tracking-[0.04em] text-primary-foreground"
          >
            Open the forge <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
