'use client';

import { Check, Copy, Download, Maximize2, Monitor, RotateCw, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createPreviewDoc } from '@/lib/preview';
import { formatBytes } from '@/lib/utils';
import type { DeviceWidth, Framework } from '@/lib/types';

interface ToolbarProps {
  activeTab: string;
  framework: Framework;
  onFrameworkChange: (f: Framework) => void;
  deviceWidth: DeviceWidth;
  onDeviceWidthChange: (d: DeviceWidth) => void;
  deviceWidthPx: number | null;
  bytes: number;
  lines: number;
  isForging: boolean;
  hasCode: boolean;
  hasSource: boolean;
  code: string;
  onForgeAgain: () => void;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}

export function Toolbar({
  activeTab,
  framework,
  onFrameworkChange,
  deviceWidth,
  onDeviceWidthChange,
  deviceWidthPx,
  bytes,
  lines,
  isForging,
  hasCode,
  hasSource,
  code,
  onForgeAgain,
  onCopy,
  onDownload,
  copied,
}: ToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>

        {/* Framework toggle — its own Tabs root so it doesn't share roving focus or
            active state with the Preview/Code tabs above (they're unrelated axes). */}
        <Tabs value={framework} onValueChange={(v) => onFrameworkChange(v as Framework)}>
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="jsx">JSX</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {(hasCode || isForging) && (
          <span className="whitespace-nowrap font-mono text-[0.7rem] text-muted-foreground sm:order-1">
            {formatBytes(bytes)} · {lines} ln
          </span>
        )}

        <div className="flex items-center gap-1.5 sm:order-2">
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1">
              <Button
                variant={deviceWidth === 'desktop' ? 'outline' : 'ghost'}
                size="icon-sm"
                onClick={() => onDeviceWidthChange('desktop')}
                aria-label="Desktop width"
                className="size-8"
              >
                <Monitor className="size-4" />
              </Button>
              <Button
                variant={deviceWidth === 'tablet' ? 'outline' : 'ghost'}
                size="icon-sm"
                onClick={() => onDeviceWidthChange('tablet')}
                aria-label="Tablet width"
                className="size-8"
              >
                <Tablet className="size-4" />
              </Button>
              <Button
                variant={deviceWidth === 'mobile' ? 'outline' : 'ghost'}
                size="icon-sm"
                onClick={() => onDeviceWidthChange('mobile')}
                aria-label="Mobile width"
                className="size-8"
              >
                <Smartphone className="size-4" />
              </Button>
            </div>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={!hasCode}
                aria-label="Expand preview to fullscreen"
                className="size-8"
              >
                <Maximize2 className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[90vh] w-full border-rule bg-background p-2 sm:h-[92vh] sm:max-w-[95vw] sm:rounded-lg">
              <DialogTitle className="sr-only">Expanded preview</DialogTitle>
              <div className="h-full w-full overflow-hidden rounded-md bg-white">
                {hasCode && (
                  <iframe
                    srcDoc={createPreviewDoc(code, deviceWidthPx)}
                    className="mx-auto h-full border-0"
                    style={deviceWidthPx ? { width: `${deviceWidthPx}px` } : { width: '100%' }}
                    sandbox="allow-scripts"
                    title="Live preview expanded"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={onForgeAgain}
            disabled={!hasSource || isForging}
          >
            <RotateCw className="size-4" />
            <span className="hidden sm:inline">Forge again</span>
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={onDownload}
            disabled={!hasCode}
            aria-label="Download code"
            className="size-8"
          >
            <Download className="size-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={onCopy} disabled={!hasCode}>
            {copied ? (
              <>
                <Check className="text-ember" /> Copied
              </>
            ) : (
              <>
                <Copy /> Copy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
