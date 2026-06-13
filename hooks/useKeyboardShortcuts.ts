'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { toast } from 'sonner';

export interface ShortcutHandlers {
  onSetSource: (file: File) => void;
  onForge: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onToggleHistory: () => void;
  onToggleShortcuts: () => void;
  onEscape: () => void;
  canForge: boolean;
  canCopy: boolean;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers): void {
  // Keep handlers current after every render without re-registering event listeners.
  const handlersRef = useRef<ShortcutHandlers>(handlers);
  useLayoutEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith('image/'),
      );
      const file = item?.getAsFile();
      if (file) {
        e.preventDefault();
        handlersRef.current.onSetSource(file);
        toast.success('Screenshot pasted');
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const tag = (e.target as HTMLElement)?.tagName;
      // Don't intercept shortcuts when the user is typing in a real input.
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (ctrl && e.key === '/') {
        e.preventDefault();
        handlersRef.current.onToggleShortcuts();
        return;
      }

      if (e.key === 'Escape') {
        handlersRef.current.onEscape();
        return;
      }

      if (ctrl && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handlersRef.current.onToggleHistory();
        return;
      }

      if (ctrl && e.key === 'Enter') {
        e.preventDefault();
        if (handlersRef.current.canForge) handlersRef.current.onForge();
        return;
      }

      if (ctrl && e.key.toLowerCase() === 'c' && handlersRef.current.canCopy) {
        // Only intercept if no text is currently selected (preserve normal copy).
        const selection = window.getSelection()?.toString() ?? '';
        if (!selection) {
          e.preventDefault();
          handlersRef.current.onCopy();
        }
        return;
      }

      if (ctrl && e.key.toLowerCase() === 's' && handlersRef.current.canCopy) {
        e.preventDefault();
        handlersRef.current.onDownload();
      }
    };

    window.addEventListener('paste', onPaste);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('paste', onPaste);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []); // stable — handlers are always read from ref
}
