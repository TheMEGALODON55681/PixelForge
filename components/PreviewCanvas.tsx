import { Loader2 } from 'lucide-react';
import { createPreviewDoc } from '@/lib/preview';

interface PreviewCanvasProps {
  code: string;
  isForging: boolean;
  deviceWidthPx: number | null;
}

export function PreviewCanvas({ code, isForging, deviceWidthPx }: PreviewCanvasProps) {
  return (
    <div className="relative h-full min-h-[20rem] overflow-hidden rounded-md bg-white ring-1 ring-rule sm:min-h-[28rem]">
      {deviceWidthPx && (
        <div className="absolute left-0 right-0 top-0 z-10 flex justify-center py-1">
          <span className="pf-kicker text-ember">{deviceWidthPx} × auto</span>
        </div>
      )}
      {isForging && <div className="pf-scan absolute inset-x-0 top-0 z-10 h-px" />}
      {code ? (
        <div className="flex h-full justify-center">
          <iframe
            srcDoc={createPreviewDoc(code, deviceWidthPx)}
            className="h-full border-0"
            style={
              deviceWidthPx
                ? { width: `${deviceWidthPx}px`, marginTop: '1.5rem' }
                : { width: '100%' }
            }
            sandbox="allow-scripts"
            title="Live preview of generated HTML"
          />
        </div>
      ) : isForging ? (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-zinc-400">
            <Loader2 className="size-5 animate-spin" />
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em]">Reading pixels</p>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-zinc-400">
              Output canvas
            </p>
            <p className="mt-1 text-xs text-zinc-400">The rendered result appears here</p>
          </div>
        </div>
      )}
    </div>
  );
}
