import { Reveal } from '@/components/landing/Reveal';

const STEPS = [
  {
    num: '01',
    phase: 'Prompt',
    title: 'Drop a screenshot',
    body: 'Upload, drag, or paste any interface screenshot. PixelForge reads the layout, spacing, and hierarchy straight from the pixels.',
  },
  {
    num: '02',
    phase: 'Heat',
    title: 'The forge streams the markup',
    body: 'GPT-4o hammers the screenshot into semantic HTML or JSX with Tailwind, streamed line by line into a live sandboxed preview.',
  },
  {
    num: '03',
    phase: 'Refinement Forge',
    title: 'Refine and ship',
    body: 'Describe a change in plain language and the forge updates the output in place. Copy the result or download it when it is ready.',
  },
];

export function Process() {
  return (
    <section className="border-t border-rule bg-secondary px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12">
          <p className="pf-kicker mb-3 text-ember-strong">How it works</p>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Three phases. One output.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 80}>
              <div className="rounded-xl border border-rule bg-card p-6 shadow-[0_1px_2px_rgba(27,28,25,0.04)]">
                <p className="pf-kicker mb-4 text-ember-strong">
                  {step.num} · {step.phase}
                </p>
                <h3 className="font-heading text-lg font-bold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
