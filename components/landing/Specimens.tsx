import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';

const SPECIMENS = [
  {
    title: 'PricingCard.tsx',
    lang: 'jsx',
    lines: 34,
    preview: `<div className="rounded-xl border p-6">
  <p className="text-sm text-muted">Pro</p>
  <p className="text-3xl font-bold">$24/mo</p>
  <ul className="mt-4 space-y-2 text-sm">
    <li>Unlimited generations</li>
    <li>Priority queue</li>
  </ul>
  <button className="mt-6 w-full rounded-lg
    bg-orange-600 py-2 text-white">
    Choose Pro
  </button>
</div>`,
  },
  {
    title: 'DashboardStats.html',
    lang: 'html',
    lines: 28,
    preview: `<section class="grid grid-cols-3 gap-4">
  <div class="rounded-lg border p-4">
    <p class="text-xs text-gray-500">Revenue</p>
    <p class="text-2xl font-semibold">$48,204</p>
    <p class="text-xs text-emerald-600">+12.4%</p>
  </div>
  <div class="rounded-lg border p-4">
    <p class="text-xs text-gray-500">Active users</p>
    <p class="text-2xl font-semibold">2,318</p>
  </div>
</section>`,
  },
];

export function Specimens() {
  return (
    <section id="specimens" className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12">
          <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight text-foreground">
            Forged specimens
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Real output from real screenshots. Every line streamed once.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {SPECIMENS.map((spec, i) => (
            <Reveal key={spec.title} delay={i * 80}>
              <div className="overflow-hidden rounded-xl border border-rule bg-card shadow-[0_1px_2px_rgba(27,28,25,0.04)]">
                <div className="flex items-center gap-2 border-b border-rule bg-secondary px-4 py-2.5">
                  <span className="size-1.5 rounded-full bg-ember shadow-[0_0_12px_rgba(230,74,25,0.4)]" />
                  <span className="font-mono text-[0.7rem] font-bold text-foreground/80">
                    {spec.title}
                  </span>
                  <span className="pf-kicker ml-auto">
                    {spec.lang} · {spec.lines} lines
                  </span>
                </div>
                <pre className="overflow-x-auto bg-code-ink px-4 py-4 font-mono text-xs leading-relaxed text-zinc-300">
                  <code>{spec.preview}</code>
                </pre>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={160} className="mt-10 flex justify-center">
          <Link
            href="/forge"
            className="inline-flex items-center gap-2 rounded-lg border border-ember px-7 py-3 font-mono text-[0.8rem] font-bold uppercase tracking-[0.04em] text-ember-strong transition-colors hover:bg-ember hover:text-primary-foreground"
          >
            Forge your own <ArrowRight className="size-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
