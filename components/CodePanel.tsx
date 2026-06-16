'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { highlightCode } from '@/lib/highlight';
import type { Framework, Status } from '@/lib/types';

interface CodePanelProps {
  code: string;
  framework: Framework;
  status: Status;
  error?: string | null;
  onRetry?: () => void;
}

export function CodePanel({ code, framework, status, error, onRetry }: CodePanelProps) {
  const lines = code ? code.split('\n') : [];

  // Highlighting only ever runs once the stream has settled — re-tokenizing on every
  // chunk during "forging" would be wasted work and would visibly flicker.
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'ready' || !code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHighlighted(null);
      return;
    }
    let cancelled = false;
    highlightCode(code, framework).then(
      (html) => {
        if (!cancelled) setHighlighted(html);
      },
      () => {
        // Highlighting failed (e.g. unsupported grammar) — fall back to plain text.
        if (!cancelled) setHighlighted(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [code, framework, status]);

  if (status === 'error') {
    return (
      <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-3 rounded-md bg-[oklch(0.13_0.006_67)] px-6 text-center ring-1 ring-rule sm:min-h-[28rem]">
        <span className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <AlertTriangle className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">Generation failed</p>
          {error && (
            <p className="mt-1 max-w-sm font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
              {error}
            </p>
          )}
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw className="size-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full min-h-[20rem] overflow-auto rounded-md bg-[oklch(0.13_0.006_67)] ring-1 ring-rule sm:min-h-[28rem]">
      {code ? (
        <div className="flex min-w-full font-mono text-xs leading-relaxed">
          <div
            aria-hidden
            className="select-none border-r border-rule px-3 py-4 text-right text-muted-foreground/50"
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {highlighted ? (
            <div
              className="pf-shiki flex-1 overflow-x-auto px-4 py-4 [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:overflow-visible"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          ) : (
            <pre className="flex-1 overflow-x-auto px-4 py-4 text-zinc-300">
              <code>{code}</code>
            </pre>
          )}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground/60">
            {'// markup will stream here'}
          </p>
        </div>
      )}
    </div>
  );
}
