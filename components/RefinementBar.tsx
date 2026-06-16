'use client';

import { useCallback, useRef, useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Status } from '@/lib/types';

interface RefinementBarProps {
  status: Status;
  activeInstruction: string | null;
  hasSourceImage: boolean;
  onSubmit: (instruction: string, includeImage: boolean) => void;
}

/**
 * The refinement loop's entry point: a one-line instruction that re-runs generation
 * against the current code instead of starting over. Only live once a generation is
 * Ready — there's nothing to refine before that.
 */
export function RefinementBar({
  status,
  activeInstruction,
  hasSourceImage,
  onSubmit,
}: RefinementBarProps) {
  const [value, setValue] = useState('');
  const [includeImage, setIncludeImage] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isForging = status === 'forging';
  const disabled = status !== 'ready';

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed, includeImage && hasSourceImage);
    setValue('');
  }, [value, disabled, includeImage, hasSourceImage, onSubmit]);

  return (
    <div className="mt-4 flex flex-col gap-2 border-t border-rule pt-4">
      <div className="flex items-center justify-between">
        <h3 className="pf-kicker">Refine</h3>
        {isForging && activeInstruction && (
          <span className="truncate font-mono text-[0.7rem] text-ember">
            Refining: &ldquo;{activeInstruction}&rdquo;
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          placeholder={
            disabled ? 'Forge a generation first' : 'Describe a change — "make the header sticky"'
          }
          aria-label="Refinement instruction"
          className="h-8 flex-1 rounded-md border border-rule bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button size="sm" onClick={submit} disabled={disabled || !value.trim()}>
          <Wand2 className="size-4" />
          Refine
        </Button>
      </div>

      {hasSourceImage && (
        <label className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
          <input
            type="checkbox"
            checked={includeImage}
            onChange={(e) => setIncludeImage(e.target.checked)}
            disabled={disabled}
            className="size-3.5 accent-ember disabled:cursor-not-allowed disabled:opacity-50"
          />
          Include original screenshot for visual context
        </label>
      )}
    </div>
  );
}
