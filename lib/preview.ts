/**
 * Wraps generated code in a full HTML document with Tailwind Play CDN for sandboxed live preview.
 * Caller is responsible for setting the iframe sandbox attribute to "allow-scripts" only.
 */
export function createPreviewDoc(code: string, deviceWidthPx?: number | null): string {
  const viewportMeta = deviceWidthPx
    ? `<meta name="viewport" content="width=${deviceWidthPx}, initial-scale=1.0" />`
    : `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`;
  // SEC-15: the sandbox is already tight (allow-scripts only, no allow-same-origin,
  // see PreviewCanvas.tsx / Toolbar.tsx). This CSP hardens the document itself. It
  // permits only the Tailwind Play CDN script and the inline styles that CDN
  // injects, and blocks any other network reach or navigation from model output.
  const csp = [
    "default-src 'none'",
    "script-src 'unsafe-inline' https://cdn.tailwindcss.com",
    "style-src 'unsafe-inline' https://cdn.tailwindcss.com",
    "img-src 'self' data: blob:",
    "font-src data:",
    "connect-src 'none'",
    "frame-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
  ].join('; ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  ${viewportMeta}
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 1rem; background: #fff; }
  </style>
</head>
<body>
${code}
</body>
</html>`;
}
