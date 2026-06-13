'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HistoryEntry } from '@/lib/types';

const STORAGE_KEY = 'pixelforge:history:v1';
const MAX_HISTORY = 10;

export interface UseHistory {
  entries: HistoryEntry[];
  add: (entry: HistoryEntry) => void;
  restore: (id: string) => HistoryEntry | undefined;
  clear: () => void;
}

function readFromStorage(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch {
    return [];
  }
}

function writeToStorage(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      // Drop two oldest entries and retry once. If still full, degrade gracefully
      // (history stays in memory for this session, but won't persist across reloads).
      const trimmed = entries.slice(0, Math.max(1, entries.length - 2));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        // Storage still full — in-memory history is preserved; persistence skipped.
      }
    }
  }
}

export function useHistory(): UseHistory {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  // Prevents the persist effect from overwriting localStorage with the initial
  // empty state before the load effect has populated entries from storage.
  const hasLoadedRef = useRef(false);

  // SSR-safe: read localStorage only after mount, never during render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(readFromStorage());
  }, []);

  // Persist on every entries change; skip the first run (pre-load empty state).
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      return;
    }
    writeToStorage(entries);
  }, [entries]);

  const add = useCallback((entry: HistoryEntry) => {
    setEntries((prev) => {
      const next = [entry, ...prev];
      if (next.length > MAX_HISTORY) next.length = MAX_HISTORY;
      return next;
    });
  }, []);

  const restore = useCallback(
    (id: string): HistoryEntry | undefined => entries.find((e) => e.id === id),
    [entries],
  );

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  return { entries, add, restore, clear };
}
