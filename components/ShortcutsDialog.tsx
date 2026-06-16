'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { ShortcutItem } from '@/lib/types';

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['Ctrl+V'], action: 'Paste image from clipboard' },
  { keys: ['Ctrl+Enter'], action: 'Forge / re-forge code' },
  { keys: ['Ctrl+Enter'], action: 'Submit refinement (when focused there)' },
  { keys: ['Ctrl+C'], action: 'Copy generated code' },
  { keys: ['Ctrl+S'], action: 'Download generated code' },
  { keys: ['Ctrl+H'], action: 'Toggle history drawer' },
  { keys: ['Ctrl+/'], action: 'Show keyboard shortcuts' },
  { keys: ['Esc'], action: 'Close any open dialog or panel' },
];

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modKey: string;
}

export function ShortcutsDialog({ open, onOpenChange, modKey }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pf-frame max-w-sm border-rule bg-background p-0">
        <DialogTitle className="sr-only">Keyboard Shortcuts</DialogTitle>
        <div className="flex items-center border-b border-rule px-5 py-4 pr-14">
          <h2 className="pf-kicker">Keyboard Shortcuts</h2>
        </div>
        <div className="p-5">
          <table className="w-full">
            <tbody className="divide-y divide-rule">
              {SHORTCUTS.map((shortcut) => (
                <tr
                  key={shortcut.action}
                  className="flex items-center justify-between py-2.5"
                >
                  <td className="text-sm text-muted-foreground">{shortcut.action}</td>
                  <td className="flex gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={key}
                        className="rounded border border-rule bg-card px-1.5 py-0.5 font-mono text-[0.65rem]"
                      >
                        {key.replace('Ctrl', modKey)}
                      </kbd>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
