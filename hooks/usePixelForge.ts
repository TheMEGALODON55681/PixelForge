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

/** Describes whichever generation request is currently "the last one" — what Retry repeats. */
type LastAction =
  | { kind: 'forge' }
  | { kind: 'refine'; instruction: string; includeImage: boolean };

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
  /** The refinement instruction currently in flight, for the "Refining: …" label. Null otherwise. */
  activeInstruction: string | null;
  setFramework: (f: Framework) => void;
  setSource: (file: File) => void;
  clearSource: () => void;
  forge: () => Promise<string | null>;
  refine: (instruction: string, includeImage: boolean) => Promise<string | null>;
  retry: () => Promise<string | null>;
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
  const [activeInstruction, setActiveInstruction] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);
  const lastActionRef = useRef<LastAction | null>(null);

  // Mirrors `code` without forcing `execute` to be re-created on every streamed chunk.
  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

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
      lastActionRef.current = null;

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
    lastActionRef.current = null;
  }, [releaseUrl]);

  /**
   * Shared plumbing for every kind of generation request: cancels any in-flight
   * stream, fires the new one, and reads it chunk-by-chunk into `code`. On
   * failure the code is rolled back to whatever it was before this attempt
   * (so a failed refinement doesn't leave a half-streamed document behind),
   * and the action is remembered so `retry()` can repeat exactly this call.
   */
  const execute = useCallback(
    async (action: LastAction, buildFormData: (previousCode: string) => FormData): Promise<string | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const snapshot = codeRef.current;
      lastActionRef.current = action;
      setActiveInstruction(action.kind === 'refine' ? action.instruction : null);
      setStatus('forging');
      setError(null);
      setCode('');

      try {
        const formData = buildFormData(snapshot);
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
        if (!finalCode) {
          // The model/provider can fail *after* the response has already started
          // streaming with a 200 (e.g. an auth rejection mid-stream) — that surfaces
          // here as a clean, empty stream rather than a thrown error. Treat it as a
          // failure too; a Ready status with a blank panel is a silent hang in disguise.
          throw new Error('Received an empty response — the model may be unavailable. Try again.');
        }
        setCode(finalCode);
        setStatus('ready');
        toast.success(action.kind === 'refine' ? 'Refined' : 'Forged', {
          description: 'Code is ready to copy',
        });
        return finalCode;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return null;
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setCode(snapshot);
        setError(message);
        setStatus('error');
        toast.error(message);
        return null;
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [],
  );

  const buildForgeFormData = useCallback(
    (file: File) => {
      const formData = new FormData();
      formData.append('mode', 'initial');
      formData.append('image', file);
      formData.append('framework', framework);
      return formData;
    },
    [framework],
  );

  const buildRefineFormData = useCallback(
    (instruction: string, includeImage: boolean, previousCode: string) => {
      const formData = new FormData();
      formData.append('mode', 'refine');
      formData.append('instruction', instruction);
      formData.append('previousCode', previousCode);
      formData.append('framework', framework);
      if (includeImage && source) formData.append('image', source.file);
      return formData;
    },
    [framework, source],
  );

  const forge = useCallback(async (): Promise<string | null> => {
    if (!source) {
      toast.error('Add a screenshot to forge from');
      return null;
    }
    return execute({ kind: 'forge' }, () => buildForgeFormData(source.file));
  }, [source, buildForgeFormData, execute]);

  const refine = useCallback(
    async (instruction: string, includeImage: boolean): Promise<string | null> => {
      const trimmed = instruction.trim();
      if (!trimmed) return null;
      if (status !== 'ready') {
        toast.error('Forge a generation before refining it');
        return null;
      }
      return execute({ kind: 'refine', instruction: trimmed, includeImage }, (previousCode) =>
        buildRefineFormData(trimmed, includeImage, previousCode),
      );
    },
    [status, buildRefineFormData, execute],
  );

  const retry = useCallback(async (): Promise<string | null> => {
    const action = lastActionRef.current;
    if (!action) return null;

    if (action.kind === 'forge') {
      if (!source) {
        toast.error('Add a screenshot to forge from');
        return null;
      }
      return execute(action, () => buildForgeFormData(source.file));
    }

    return execute(action, (previousCode) =>
      buildRefineFormData(action.instruction, action.includeImage, previousCode),
    );
  }, [source, buildForgeFormData, buildRefineFormData, execute]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setCode('');
    setStatus('idle');
    setError(null);
    setActiveInstruction(null);
    lastActionRef.current = null;
  }, []);

  const restoreCode = useCallback((restoredCode: string, restoredFramework: Framework) => {
    setCode(restoredCode);
    setFramework(restoredFramework);
    setStatus('ready');
    setError(null);
    setActiveInstruction(null);
    lastActionRef.current = null;
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
    activeInstruction,
    setFramework,
    setSource,
    clearSource,
    forge,
    refine,
    retry,
    abort,
    reset,
    restoreCode,
  };
}
