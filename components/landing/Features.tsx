import { Reveal } from '@/components/landing/Reveal';

const FEATURES = [
  {
    mark: '01',
    label: 'Two output targets',
    body: 'Forge semantic HTML or React JSX from the same screenshot. Switch the framework toggle before or after the first pass.',
  },
  {
    mark: '02',
    label: 'Live sandboxed preview',
    body: 'Every generation renders instantly in an isolated iframe, so you see the real result while the code is still streaming in.',
  },
  {
    mark: '03',
    label: 'Refinement loop',
    body: 'Keep iterating on the same output. Each refinement reads the previous code and the original screenshot, and builds on both.',
  },
  {
    mark: '04',
    label: 'Tailwind by default',
    body: 'Output ships with utility classes, not inline styles or a separate stylesheet, so it drops straight into a Tailwind project.',
  },
  {
    mark: '05',
    label: 'History that survives reload',
    body: 'The last ten generations persist in the browser with thumbnails, so you can pick up a session without losing work.',
  },
  {
    mark: '06',
    label: 'Copy-clean output',
    body: 'No wrapper commentary, no boilerplate scaffolding. What streams in is what you copy or download.',
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-rule px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12">
          <p className="pf-kicker mb-3 text-ember-strong">Features</p>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Built for the way you actually work
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat, i) => (
            <Reveal key={feat.mark} delay={i * 60}>
              <div className="rounded-xl border border-rule bg-card p-6 shadow-[0_1px_2px_rgba(27,28,25,0.04)]">
                <span className="pf-kicker mb-2.5 block text-ember-strong">{feat.mark}</span>
                <h3 className="font-heading text-base font-bold tracking-tight text-foreground">
                  {feat.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feat.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
