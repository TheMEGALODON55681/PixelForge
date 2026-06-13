'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardPaste, Hammer, History, Keyboard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { usePixelForge } from '@/hooks/usePixelForge';
import { useHistory } from '@/hooks/useHistory';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { UploadDropzone } from '@/components/UploadDropzone';
import { PreviewCanvas } from '@/components/PreviewCanvas';
import { CodePanel } from '@/components/CodePanel';
import { Toolbar } from '@/components/Toolbar';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { ShortcutsDialog } from '@/components/ShortcutsDialog';
import { createThumbnail, formatBytes } from '@/lib/utils';
import type { DeviceWidth, HistoryEntry, Status } from '@/lib/types';

function StatusChip({ status }: { status: Status }) {
  const map: Record<Status, { label: string; dot: string }> = {
    idle: { label: 'Idle', dot: 'bg-muted-foreground/60' },
    forging: { label: 'Forging', dot: 'bg-ember animate-pulse' },
    ready: { label: 'Ready', dot: 'bg-ember' },
    error: { label: 'Error', dot: 'bg-destructive' },
  };
  const { label, dot } = map[status];
  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-card px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em]"
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function CornerTicks() {
  const base = 'pf-tick';
  return (
    <>
      <span className={`${base} left-0 top-0 border-l border-t`} />
      <span className={`${base} right-0 top-0 border-r border-t`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} />
    </>
  );
}

export default function Home() {
  const {
    status,
    code,
    framework,
    source,
    sourceMeta,
    bytes,
    lines,
    setFramework,
    setSource,
    clearSource,
    forge,
    restoreCode,
  } = usePixelForge();

  const { entries: historyEntries, add: addToHistory, restore: getHistoryEntry } = useHistory();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [deviceWidth, setDeviceWidth] = useState<DeviceWidth>('desktop');
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false);
  // SSR-safe: starts false, corrected client-side to avoid hydration mismatch.
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData;
    const platform = navigator.platform || uaData?.platform || '';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMac(platform.toLowerCase().includes('mac'));
  }, []);

  const modKey = isMac ? '⌘' : 'Ctrl';

  const deviceWidthPx = useMemo<number | null>(() => {
    switch (deviceWidth) {
      case 'mobile': return 375;
      case 'tablet': return 768;
      default: return null;
    }
  }, [deviceWidth]);

  const handleForge = useCallback(async () => {
    const finalCode = await forge();
    if (finalCode === null || !source) return;
    let thumbnail = '';
    try {
      thumbnail = await createThumbnail(source.url);
    } catch {
      // Thumbnail generation failed — entry still added, just without a preview image.
    }
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      framework,
      byteCount: new TextEncoder().encode(finalCode).length,
      code: finalCode,
      thumbnail,
    };
    addToHistory(entry);
  }, [forge, source, framework, addToHistory]);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  }, [code]);

  const handleDownload = useCallback(() => {
    if (!code) return;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const ext = framework === 'jsx' ? 'jsx' : 'html';
    const filename = `pixelforge-${timestamp}.${ext}`;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded', { description: filename });
  }, [code, framework]);

  const handleLoadExample = useCallback(async () => {
    try {
      const response = await fetch('/example.png');
      if (!response.ok) throw new Error('Failed to load example');
      const blob = await response.blob();
      const file = new File([blob], 'example.png', { type: blob.type });
      setSource(file);
      toast.success('Example loaded');
    } catch {
      toast.error("Couldn't load the example screenshot");
    }
  }, [setSource]);

  const handleRestore = useCallback(
    (id: string) => {
      const entry = getHistoryEntry(id);
      if (!entry) return;
      clearSource();
      restoreCode(entry.code, entry.framework);
      setHistoryOpen(false);
      toast.success('Restored generation from history');
    },
    [getHistoryEntry, clearSource, restoreCode],
  );

  const isForging = status === 'forging';

  useKeyboardShortcuts({
    onSetSource: setSource,
    onForge: handleForge,
    onCopy: handleCopy,
    onDownload: handleDownload,
    onToggleHistory: () => setHistoryOpen((o) => !o),
    onToggleShortcuts: () => setShortcutsOpen((o) => !o),
    onEscape: () => {
      setShortcutsOpen(false);
      setHistoryOpen(false);
    },
    canForge: !!source && !isForging,
    canCopy: !!code,
  });

  return (
    <main className="relative flex min-h-screen flex-col">
      <Toaster position="top-right" />

      {/* Instrument top bar */}
      <header className="sticky top-0 z-20 border-b border-rule bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary/12 text-ember ring-1 ring-ember/30">
              <Hammer className="size-4" aria-hidden />
            </span>
            <span className="text-sm font-semibold tracking-tight">PixelForge</span>
            <span className="pf-kicker hidden sm:inline">· screenshot → code</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              disabled={historyEntries.length === 0}
              className="hidden font-mono text-[0.68rem] uppercase tracking-[0.18em] sm:inline-flex"
            >
              <History className="mr-1.5 size-3.5" />
              History ({historyEntries.length})
            </Button>
            <StatusChip status={status} />
            <span className="pf-kicker hidden md:inline">gpt-4o · github models</span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
        {/* Editorial intro — voiced, not a generic gradient hero. */}
        <div className="mb-8 max-w-2xl">
          <p className="pf-kicker mb-3">The forge</p>
          <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            Drop a screenshot.{' '}
            <span className="text-ember">Forge the markup.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            PixelForge reads any interface and hammers it into clean, semantic HTML and Tailwind —
            streamed line by line, rendered live as it builds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* SOURCE rail */}
          <section className="pf-frame flex flex-col p-5">
            <CornerTicks />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="pf-kicker">Source</h2>
              {sourceMeta && (
                <span className="font-mono text-[0.7rem] text-muted-foreground">
                  {sourceMeta.w}×{sourceMeta.h}
                </span>
              )}
            </div>

            <UploadDropzone
              source={source}
              onFileSelect={setSource}
              onLoadExample={handleLoadExample}
            />

            {source && (
              <p className="mt-3 truncate font-mono text-[0.7rem] text-muted-foreground">
                {source.file.name} · {formatBytes(source.file.size)}
              </p>
            )}

            <Button
              onClick={handleForge}
              disabled={!source || isForging}
              size="lg"
              className="mt-4 w-full"
            >
              {isForging ? (
                <>
                  <Loader2 className="animate-spin" />
                  Forging…
                </>
              ) : (
                <>
                  <Hammer />
                  Forge code
                </>
              )}
            </Button>

            <p className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
              <ClipboardPaste className="size-3" aria-hidden />
              Tip: copy a screenshot, then press{' '}
              <kbd className="rounded border border-rule bg-card px-1 font-mono text-[0.65rem]">
                {modKey}V
              </kbd>{' '}
              anywhere.
            </p>
          </section>

          {/* OUTPUT workspace */}
          <section className="pf-frame flex min-h-[20rem] flex-col p-5 sm:min-h-[28rem]">
            <CornerTicks />
            <Tabs
              defaultValue="preview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex w-full flex-1 flex-col"
            >
              <Toolbar
                activeTab={activeTab}
                framework={framework}
                onFrameworkChange={setFramework}
                deviceWidth={deviceWidth}
                onDeviceWidthChange={setDeviceWidth}
                deviceWidthPx={deviceWidthPx}
                bytes={bytes}
                lines={lines}
                isForging={isForging}
                hasCode={!!code}
                hasSource={!!source}
                code={code}
                onForgeAgain={handleForge}
                onCopy={handleCopy}
                onDownload={handleDownload}
                copied={copied}
              />

              <TabsContent value="preview" className="mt-0 flex-1">
                <PreviewCanvas code={code} isForging={isForging} deviceWidthPx={deviceWidthPx} />
              </TabsContent>

              <TabsContent value="code" className="mt-0 flex-1">
                <CodePanel code={code} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <p className="pf-kicker">
            Next.js · Tailwind · Vercel AI SDK · GitHub Models
          </p>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShortcutsOpen(true)}
            aria-label="Keyboard shortcuts"
            className="size-8"
          >
            <Keyboard className="size-4" />
          </Button>
        </div>
      </footer>

      <HistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        entries={historyEntries}
        onRestore={handleRestore}
      />

      <ShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
        modKey={modKey}
      />
    </main>
  );
}
