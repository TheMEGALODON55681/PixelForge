'use client';

import Image from 'next/image';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { formatBytes } from '@/lib/utils';
import type { HistoryEntry } from '@/lib/types';

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: HistoryEntry[];
  onRestore: (id: string) => void;
}

function formatTimestamp(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  return `${Math.floor(seconds / 3600)} hr ago`;
}

export function HistoryDrawer({ open, onOpenChange, entries, onRestore }: HistoryDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed right-0 top-0 h-full w-full max-w-sm translate-x-0 translate-y-0 rounded-none border-l border-rule bg-background p-0 sm:max-w-sm">
        <DialogTitle className="sr-only">History</DialogTitle>
        <div className="flex h-full flex-col">
          <div className="flex items-center border-b border-rule px-5 py-4 pr-14">
            <h2 className="pf-kicker">History</h2>
          </div>
          <div className="flex-1 overflow-auto p-5">
            {entries.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <History className="size-8 opacity-30" />
                <p className="pf-kicker text-center">No generations yet</p>
                <p className="text-center text-xs opacity-60">Generated code will appear here</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex gap-3 rounded-md border border-rule bg-card p-3"
                  >
                    <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded bg-background">
                      {entry.thumbnail ? (
                        <Image
                          src={entry.thumbnail}
                          alt="Screenshot thumbnail"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <History className="size-4 opacity-30" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="font-mono text-[0.7rem] text-muted-foreground">
                          {formatTimestamp(entry.timestamp)}
                        </p>
                        <p className="font-mono text-[0.68rem] text-muted-foreground">
                          {formatBytes(entry.byteCount)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRestore(entry.id)}
                        className="h-7 self-start text-xs"
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
