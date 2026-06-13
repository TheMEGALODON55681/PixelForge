'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Framework, Status } from '@/lib/types';

const MAX_BYTES = 10 * 1024 * 1024;

/** Strips markdown code fences that the model occasionally emits despite instructions. */
const stripCodeFences = (code: string): string =>
  code
    .replace(/^```(?:html|jsx|tsx|javascript|typescript)?\s*\n?/i, '')
    .replace(/\n?```\s*$/, '')
    .trim();

export interface PixelForgeSource {
  file: File;
  url: string;
}

export interface UsePixelForge {
  status: Status;
  code: string;
  framework: Framework;
  source: PixelForgeSource | null;
  sourceMeta: { w: number; h: number } | null;
  bytes: number;
  lines: number;
  error: string | null;
  setFramework: (f: Framework) => void;
  setSource: (file: File) => void;
  clearSource: () => void;
  forge: () => Promise<string | null>;
  abort: () => void;
  reset: () => void;
  restoreCode: (code: string, framework: Framework) => void;
}

export function usePixelForge(): UsePixelForge {
  const [status, setStatus] = useState<Status>('idle');
  const [code, setCode] = useState('');
  const [framework, setFramework] = useState<Framework>('html');
  const [source, setSourceState] = useState<PixelForgeSource | null>(null);
  const [sourceMeta, setSourceMeta] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);

  const releaseUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const setSource = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error("That file isn't an image");
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error('Image must be smaller than 10MB');
        return;
      }

      releaseUrl();
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setSourceState({ file, url });
      setCode('');
      setSourceMeta(null);
      setError(null);
      setStatus('idle');

      const probe = new window.Image();
      probe.onload = () => setSourceMeta({ w: probe.naturalWidth, h: probe.naturalHeight });
      probe.src = url;
    },
    [releaseUrl],
  );

  const clearSource = useCallback(() => {
    releaseUrl();
    setSourceState(null);
    setSourceMeta(null);
    setCode('');
    setStatus('idle');
    setError(null);
  }, [releaseUrl]);

  const forge = useCallback(async (): Promise<string | null> => {
    if (!source) {
      toast.error('Add a screenshot to forge from');
      return null;
    }

    // Cancel any in-flight generation before starting a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('forging');
    setCode('');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', source.file);
      formData.append('framework', framework);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate code');
      }
      if (!response.body) throw new Error('No response stream');

      /** Reads the text stream chunk-by-chunk, updating live code state on every token. */
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setCode(stripCodeFences(accumulated));
      }

      const finalCode = stripCodeFences(accumulated);
      setCode(finalCode);
      setStatus('ready');
      toast.success('Forged', { description: 'Code is ready to copy' });
      return finalCode;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return null;
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setStatus('error');
      toast.error(message);
      return null;
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [source, framework]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setCode('');
    setStatus('idle');
    setError(null);
  }, []);

  const restoreCode = useCallback((restoredCode: string, restoredFramework: Framework) => {
    setCode(restoredCode);
    setFramework(restoredFramework);
    setStatus('ready');
    setError(null);
  }, []);

  // Cleanup on unmount: cancel any in-flight stream and revoke the source blob URL.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      releaseUrl();
    },
    [releaseUrl],
  );

  const { bytes, lines } = useMemo(() => {
    const b = new TextEncoder().encode(code).length;
    const l = code ? code.split('\n').length : 0;
    return { bytes: b, lines: l };
  }, [code]);

  return {
    status,
    code,
    framework,
    source,
    sourceMeta,
    bytes,
    lines,
    error,
    setFramework,
    setSource,
    clearSource,
    forge,
    abort,
    reset,
    restoreCode,
  };
}
