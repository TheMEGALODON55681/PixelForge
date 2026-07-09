/** Sticky header height, in pixels, that in-page anchor scrolls must offset for. */
export const HEADER_OFFSET = 64;

/** Smooth-scrolls to an element by id, accounting for the sticky header. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: 'smooth' });
}
