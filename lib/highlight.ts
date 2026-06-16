import type { Highlighter } from 'shiki';
import type { Framework } from '@/lib/types';

/** The only theme PixelForge ships — tuned to sit on the ember-on-graphite panel background. */
export const SHIKI_THEME = 'github-dark';

/**
 * Lazily creates a single Shiki highlighter instance, shared across every call.
 * The `shiki` package (and its wasm grammar/theme data) is only fetched once a
 * highlight is actually requested — never part of the initial bundle.
 */
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({
        themes: [SHIKI_THEME],
        langs: ['html', 'jsx'],
      }),
    );
  }
  return highlighterPromise;
}

/** Highlights `code` as HTML, one `<span class="line">` per source line, ready to drop into the DOM. */
export async function highlightCode(code: string, framework: Framework): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, { lang: framework, theme: SHIKI_THEME });
}
