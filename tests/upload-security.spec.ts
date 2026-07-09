import { test, expect } from '@playwright/test';
import sharp from 'sharp';

const EXAMPLE_PATH = 'public/example.png';

test.describe('upload security boundary (/api/generate)', () => {
  test('oversized file (>10MB) is rejected before forwarding', async ({ request }) => {
    const big = Buffer.alloc(10 * 1024 * 1024 + 1024, 1);
    const res = await request.post('/api/generate', {
      multipart: {
        mode: 'initial',
        framework: 'html',
        image: { name: 'big.png', mimeType: 'image/png', buffer: big },
      },
    });
    expect(res.status()).toBe(400);
  });

  test('empty file is rejected', async ({ request }) => {
    const res = await request.post('/api/generate', {
      multipart: {
        mode: 'initial',
        framework: 'html',
        image: { name: 'empty.png', mimeType: 'image/png', buffer: Buffer.alloc(0) },
      },
    });
    expect(res.status()).toBe(400);
  });

  test('disallowed declared type is rejected', async ({ request }) => {
    const res = await request.post('/api/generate', {
      multipart: {
        mode: 'initial',
        framework: 'html',
        image: { name: 'x.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') },
      },
    });
    expect(res.status()).toBe(400);
  });

  test('allowed extension with mismatched signature is rejected (magic-byte check)', async ({ request }) => {
    const notReallyPng = Buffer.from('this is definitely not an image');
    const res = await request.post('/api/generate', {
      multipart: {
        mode: 'initial',
        framework: 'html',
        image: { name: 'fake.png', mimeType: 'image/png', buffer: notReallyPng },
      },
    });
    expect(res.status()).toBe(400);
  });

  test('a PDF renamed to .png is rejected', async ({ request }) => {
    const pdfBytes = Buffer.from('%PDF-1.4\n%fake pdf content padded out a bit further');
    const res = await request.post('/api/generate', {
      multipart: {
        mode: 'initial',
        framework: 'html',
        image: { name: 'evil.png', mimeType: 'image/png', buffer: pdfBytes },
      },
    });
    expect(res.status()).toBe(400);
  });

  test('a real PNG declared as a different type is rejected (declared/signature mismatch)', async ({ request }) => {
    const fs = await import('fs/promises');
    const realPng = await fs.readFile(EXAMPLE_PATH);
    const res = await request.post('/api/generate', {
      multipart: {
        mode: 'initial',
        framework: 'html',
        image: { name: 'x.jpg', mimeType: 'image/jpeg', buffer: realPng },
      },
    });
    expect(res.status()).toBe(400);
  });

  test('a malformed/truncated image is rejected by the decode pass', async ({ request }) => {
    const truncated = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from('not a real png body, just garbage bytes after the header'),
    ]);
    const res = await request.post('/api/generate', {
      multipart: {
        mode: 'initial',
        framework: 'html',
        image: { name: 'broken.png', mimeType: 'image/png', buffer: truncated },
      },
    });
    expect(res.status()).toBe(400);
  });

  test('a decompression-bomb-style oversized-dimension image is rejected', async ({ request }) => {
    const bomb = await sharp({
      create: { width: 5000, height: 5000, channels: 3, background: { r: 200, g: 0, b: 0 } },
    })
      .png()
      .toBuffer();

    const res = await request.post('/api/generate', {
      multipart: {
        mode: 'initial',
        framework: 'html',
        image: { name: 'bomb.png', mimeType: 'image/png', buffer: bomb },
      },
    });
    expect(res.status()).toBe(400);
  });

  test('a valid PNG passes validation and starts forging', async ({ request }) => {
    test.setTimeout(90_000);
    const fs = await import('fs/promises');
    const realPng = await fs.readFile(EXAMPLE_PATH);
    const res = await request.post('/api/generate', {
      multipart: {
        mode: 'initial',
        framework: 'html',
        image: { name: 'example.png', mimeType: 'image/png', buffer: realPng },
      },
    });
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });

  test('repeated rapid uploads trigger the rate limit', async ({ request }) => {
    const badImage = Buffer.from('GIF89a');
    let sawLimit = false;
    for (let i = 0; i < 20; i++) {
      const res = await request.post('/api/generate', {
        multipart: {
          mode: 'initial',
          framework: 'html',
          image: { name: 'x.gif', mimeType: 'image/gif', buffer: badImage },
        },
      });
      if (res.status() === 429) {
        sawLimit = true;
        expect(res.headers()['retry-after']).toBeTruthy();
        break;
      }
    }
    expect(sawLimit).toBe(true);
  });
});
