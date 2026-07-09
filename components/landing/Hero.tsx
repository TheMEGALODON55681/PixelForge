'use client';

import Link from 'next/link';
import { ChevronRight, Zap } from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';

const HERO_CODE = `export function PricingCard({ tier, price, features }) {
  return (
    <div className="rounded-xl border p-6
                     transition-shadow hover:shadow-lg">
      <p className="text-sm text-muted">{tier}</p>
      <p className="text-3xl font-bold">{price}</p>
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  );
}`;

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            'linear-gradient(var(--pf-steel-700) 0.75px, transparent 0.75px), linear-gradient(90deg, var(--pf-steel-700) 0.75px, transparent 0.75px)',
          backgroundSize: '38px 38px',
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:gap-16">
          <Reveal className="max-w-xl">
            <p className="pf-kicker mb-4 text-ember-strong">Screenshot to code · Beta</p>
            <h1 className="text-balance font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Forge clean code from any screenshot
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Drop a screenshot of any interface. PixelForge reads the pixels and hammers out
              semantic HTML or JSX with Tailwind, streamed live into a working preview.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/forge"
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-mono text-[0.8rem] font-bold uppercase tracking-[0.04em] text-primary-foreground shadow-[0_2px_4px_rgba(27,28,25,0.06)] transition-transform active:scale-[0.98]"
              >
                <Zap className="size-3.5" strokeWidth={2.5} />
                Forge
              </Link>
              <a
                href="#specimens"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('specimens')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 rounded-md border border-rule px-5 py-3 font-mono text-[0.8rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                See specimens <ChevronRight className="size-3.5" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="min-w-0 flex-1">
            <div
              className="overflow-hidden rounded-2xl border border-rule shadow-[0_2px_4px_rgba(27,28,25,0.06)]"
              style={{ background: '#FCFBF8' }}
            >
              <div className="flex items-center gap-2 border-b border-rule bg-secondary px-4 py-2.5">
                {['#F87171', '#FBBF24', '#34D399'].map((c) => (
                  <span key={c} className="inline-block size-3 rounded-full" style={{ background: c }} />
                ))}
                <span className="ml-2 font-mono text-[0.68rem] text-muted-foreground">
                  PricingCard.tsx · Forge bench
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-ember shadow-[0_0_12px_rgba(230,74,25,0.4)]" />
                  <span className="pf-kicker text-ember-strong">Forged</span>
                </span>
              </div>
              <pre className="overflow-x-auto bg-code-ink px-4 py-4 font-mono text-xs leading-relaxed text-zinc-300">
                <code>{HERO_CODE}</code>
              </pre>
              <div className="border-t border-rule px-4 py-3">
                <div className="flex items-center gap-2 rounded-md border border-rule-structural bg-background px-3.5 py-2.5 text-sm text-muted-foreground">
                  A pricing card, from a screenshot, with hover state and a feature list
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
