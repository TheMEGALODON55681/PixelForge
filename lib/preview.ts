/**
 * Wraps generated code in a full HTML document with Tailwind Play CDN for sandboxed live preview.
 * Caller is responsible for setting the iframe sandbox attribute to "allow-scripts" only.
 */
export function createPreviewDoc(code: string, deviceWidthPx?: number | null): string {
  const viewportMeta = deviceWidthPx
    ? `<meta name="viewport" content="width=${deviceWidthPx}, initial-scale=1.0" />`
    : `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
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
