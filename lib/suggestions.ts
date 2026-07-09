/**
 * Refinement suggestions shown in the workspace once a generation is ready.
 * Adapted from the design bundle's prompt pool to describe edits against an
 * existing forged component rather than a from-scratch generation, since the
 * real product forges from a screenshot, not a text prompt (see PRD 3.3).
 */
export const SUGGESTION_POOL = [
  'Add a hover state with a subtle shadow lift',
  'Add a loading skeleton that matches this layout',
  'Make this responsive down to a 375px viewport',
  'Add a dark mode variant using the same tokens',
  'Turn the static list into a sortable table',
  'Add pagination controls below the results',
  'Add a disabled state with reduced opacity',
  'Replace the inline styles with Tailwind classes',
  'Add keyboard focus rings to every interactive element',
  'Add an empty state with an icon and a short message',
  'Add a copy-to-clipboard button next to the code block',
  'Add a toast notification on successful submit',
  'Make the sidebar collapsible with an icon-only mode',
  'Add ARIA labels to the icon-only buttons',
  'Add a subtle entrance animation using opacity and transform',
  'Split the long form into a multi-step stepper',
  'Add a search input that filters the visible rows',
  'Add a tooltip to the truncated labels',
  'Add a progress bar for the upload state',
  'Add a confirmation dialog before the destructive action',
  'Tighten the spacing so the card reads less cluttered',
  'Add an active-tab indicator that slides between tabs',
  'Add a character counter under the textarea',
  'Add a subtle border and shadow to separate the panels',
];

export const VISIBLE_SUGGESTION_COUNT = 3;

/** Samples `VISIBLE_SUGGESTION_COUNT` suggestions without replacement. */
export function sampleSuggestions(): string[] {
  const pool = [...SUGGESTION_POOL];
  const result: string[] = [];
  for (let i = 0; i < VISIBLE_SUGGESTION_COUNT; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}
