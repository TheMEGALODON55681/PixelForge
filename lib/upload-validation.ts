import sharp from 'sharp';

/**
 * Server-side upload hardening for the trusted API boundary (see PRD Section 12).
 * The uploaded image is never written to disk and never served back to a
 * browser, it is validated, decoded, re-encoded, base64-encoded, and sent to
 * the model. Storage-path, path-traversal, and serving-header protections do
 * not apply here because there is no stored file; this module instead
 * hardens the three real risks: the browser-declared MIME string (untrusted),
 * a crafted or oversized bitmap exhausting decode memory/time, and metadata
 * or trailing polyglot bytes riding along in the original upload.
 */

export const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 4096;
const MAX_PIXELS = MAX_DIMENSION * MAX_DIMENSION; // decompression-bomb guard (SEC-7)
const DECODE_TIMEOUT_MS = 8000;

export interface ValidationSuccess {
  ok: true;
  /** The re-encoded, metadata-stripped buffer. This, never the original bytes, is what gets base64-encoded. */
  buffer: Buffer;
  mimeType: AllowedMimeType;
  width: number;
  height: number;
}

export interface ValidationFailure {
  ok: false;
  /** Internal reason code, safe to log server-side. Never includes raw bytes. */
  reason: string;
  /** Short, non-leaky message safe to return to the client. */
  message: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

const GENERIC_MESSAGE = 'Unsupported or invalid image.';

function detectSignature(buf: Buffer): AllowedMimeType | null {
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

function withTimeout<T>(promise: Promise<T>, ms: number, reason: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(reason)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/**
 * Validates an uploaded image at the trusted server boundary and returns a
 * safely re-encoded, metadata-stripped buffer. Never trusts the browser's
 * declared MIME type as proof of content, the real signature (magic bytes)
 * must match, and the declared type must agree with it.
 */
export async function validateAndReencodeImage(file: File): Promise<ValidationResult> {
  // SEC-1: size ceiling and empty-file rejection, enforced server-side regardless of client checks.
  if (file.size === 0) {
    return { ok: false, reason: 'empty-file', message: GENERIC_MESSAGE };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, reason: 'too-large', message: 'Image must be smaller than 10MB.' };
  }

  // SEC-2: declared-type allowlist.
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return { ok: false, reason: 'disallowed-declared-type', message: GENERIC_MESSAGE };
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // SEC-3/4/5/6: magic-byte signature check, cross-checked against the declared
  // type. A PDF, SVG, HTML document, or any file that doesn't match one of the
  // three allowed signatures is rejected here, before any decode is attempted.
  const detected = detectSignature(bytes);
  if (!detected) {
    return { ok: false, reason: 'signature-not-recognized', message: GENERIC_MESSAGE };
  }
  if (detected !== file.type) {
    return { ok: false, reason: 'signature-type-mismatch', message: GENERIC_MESSAGE };
  }

  try {
    // SEC-7: limitInputPixels bounds the decoder itself, so a small file that
    // decodes to an enormous bitmap (a decompression bomb) fails during decode
    // rather than exhausting memory first.
    const image = sharp(bytes, { limitInputPixels: MAX_PIXELS, failOn: 'error' });
    const metadata = await withTimeout(image.metadata(), DECODE_TIMEOUT_MS, 'decode-timeout');

    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    if (!width || !height) {
      return { ok: false, reason: 'decode-failed', message: GENERIC_MESSAGE };
    }
    if (width > MAX_DIMENSION || height > MAX_DIMENSION || width * height > MAX_PIXELS) {
      return { ok: false, reason: 'dimensions-too-large', message: 'Image dimensions are too large.' };
    }

    // SEC-8/9: re-encode through sharp, which strips EXIF and other metadata
    // by default and neutralizes any polyglot data appended after the image.
    const format = detected === 'image/png' ? 'png' : detected === 'image/webp' ? 'webp' : 'jpeg';
    const reencoded = await withTimeout(
      image.toFormat(format).toBuffer(),
      DECODE_TIMEOUT_MS,
      'reencode-timeout',
    );

    return { ok: true, buffer: reencoded, mimeType: detected, width, height };
  } catch (err) {
    // SEC-10: decode/re-encode is bounded by withTimeout above; any other
    // decode failure (truncated or malformed image) lands here too.
    const isTimeout = err instanceof Error && err.message.endsWith('timeout');
    return {
      ok: false,
      reason: isTimeout ? (err as Error).message : 'decode-failed',
      message: isTimeout ? 'Image processing timed out.' : GENERIC_MESSAGE,
    };
  }
}
