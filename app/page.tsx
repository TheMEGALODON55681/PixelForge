"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Upload,
  Loader2,
  Maximize2,
  ClipboardPaste,
  Hammer,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Status = "idle" | "forging" | "ready";

const stripCodeFences = (code: string): string =>
  code
    .replace(/^```(?:html|jsx|tsx|javascript|typescript)?\s*\n?/i, "")
    .replace(/\n?```\s*$/, "")
    .trim();

const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const MAX_BYTES = 10 * 1024 * 1024;

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Revoke any object URL we created so blob previews don't leak.
  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const acceptFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("That file isn't an image");
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error("Image must be smaller than 10MB");
        return;
      }

      releaseObjectUrl();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;

      setImageFile(file);
      setImagePreview(url);
      setGeneratedCode("");
      setImageMeta(null);

      // Read intrinsic dimensions for the metadata readout.
      const probe = new window.Image();
      probe.onload = () =>
        setImageMeta({ w: probe.naturalWidth, h: probe.naturalHeight });
      probe.src = url;
    },
    [releaseObjectUrl],
  );

  const handleSubmit = useCallback(async () => {
    if (!imageFile) {
      toast.error("Add a screenshot to forge from");
      return;
    }

    // Cancel any in-flight generation before starting a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setGeneratedCode("");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate code");
      }
      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setGeneratedCode(stripCodeFences(accumulated));
      }

      toast.success("Forged", { description: "Code is ready to copy" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
      console.error(error);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsGenerating(false);
      }
    }
  }, [imageFile]);

  const handleCopy = useCallback(async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  }, [generatedCode]);

  // Paste-a-screenshot (⌘/Ctrl+V) — the way screenshots are actually captured.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      const file = item?.getAsFile();
      if (file) {
        e.preventDefault();
        acceptFile(file);
        toast.success("Screenshot pasted");
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [acceptFile]);

  // Cleanup on unmount: cancel stream + revoke blob URL.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      releaseObjectUrl();
    },
    [releaseObjectUrl],
  );

  const status: Status = isGenerating
    ? "forging"
    : generatedCode
      ? "ready"
      : "idle";

  const telemetry = useMemo(() => {
    const bytes = new TextEncoder().encode(generatedCode).length;
    const lines = generatedCode ? generatedCode.split("\n").length : 0;
    return { bytes, lines };
  }, [generatedCode]);

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
            <span className="text-sm font-semibold tracking-tight">
              PixelForge
            </span>
            <span className="pf-kicker hidden sm:inline">
              · screenshot → code
            </span>
          </div>

          <div className="flex items-center gap-3">
            <StatusChip status={status} />
            <span className="pf-kicker hidden md:inline">
              gpt-4o · github models
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
        {/* Editorial intro — voiced, not a generic gradient hero. */}
        <div className="mb-8 max-w-2xl">
          <p className="pf-kicker mb-3">The forge</p>
          <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            Drop a screenshot.{" "}
            <span className="text-ember">Forge the markup.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            PixelForge reads any interface and hammers it into clean, semantic
            HTML and Tailwind — streamed line by line, rendered live as it
            builds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* SOURCE rail */}
          <section className="pf-frame flex flex-col p-5">
            <CornerTicks />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="pf-kicker">Source</h2>
              {imageMeta && (
                <span className="font-mono text-[0.7rem] text-muted-foreground">
                  {imageMeta.w}×{imageMeta.h}
                </span>
              )}
            </div>

            <label
              htmlFor="file-upload"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) acceptFile(file);
              }}
              className={`group relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-dashed transition-colors ${
                isDragging
                  ? "border-ember bg-primary/5"
                  : "border-rule bg-background/40 hover:border-ember/50 hover:bg-background/70"
              }`}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Uploaded screenshot preview"
                  fill
                  className="object-contain p-3"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <span className="flex size-10 items-center justify-center rounded-md bg-card ring-1 ring-rule transition-colors group-hover:text-ember">
                    <Upload className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      Drop, paste, or click to upload
                    </p>
                    <p className="mt-1 font-mono text-[0.7rem] text-muted-foreground">
                      PNG · JPG · WEBP — up to 10MB
                    </p>
                  </div>
                </div>
              )}
              <input
                id="file-upload"
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) acceptFile(file);
                  e.target.value = "";
                }}
              />
            </label>

            {imageFile && (
              <p className="mt-3 truncate font-mono text-[0.7rem] text-muted-foreground">
                {imageFile.name} · {formatBytes(imageFile.size)}
              </p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!imageFile || isGenerating}
              size="lg"
              className="mt-4 w-full"
            >
              {isGenerating ? (
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
              Tip: copy a screenshot, then press{" "}
              <kbd className="rounded border border-rule bg-card px-1 font-mono text-[0.65rem]">
                ⌘V
              </kbd>{" "}
              anywhere.
            </p>
          </section>

          {/* OUTPUT workspace */}
          <section className="pf-frame flex min-h-[28rem] flex-col p-5">
            <CornerTicks />
            <Tabs defaultValue="preview" className="flex w-full flex-1 flex-col">
              <div className="mb-4 flex items-center justify-between gap-2">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-3">
                  {(generatedCode || isGenerating) && (
                    <span className="hidden font-mono text-[0.7rem] text-muted-foreground sm:inline">
                      {formatBytes(telemetry.bytes)} · {telemetry.lines} ln
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          disabled={!generatedCode}
                          aria-label="Expand preview to fullscreen"
                        >
                          <Maximize2 />
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        style={{ maxWidth: "95vw", width: "95vw" }}
                        className="h-[92vh] border-rule bg-background p-2 sm:rounded-lg sm:max-w-[95vw]"
                      >
                        <DialogTitle className="sr-only">
                          Expanded preview
                        </DialogTitle>
                        <div className="h-full w-full overflow-hidden rounded-md bg-white">
                          {generatedCode ? (
                            <iframe
                              srcDoc={createPreviewDoc(generatedCode)}
                              className="h-full w-full border-0"
                              sandbox="allow-scripts"
                              title="Live preview expanded"
                            />
                          ) : null}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!generatedCode}
                    >
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

              <TabsContent value="preview" className="mt-0 flex-1">
                <PreviewCanvas
                  code={generatedCode}
                  isGenerating={isGenerating}
                />
              </TabsContent>

              <TabsContent value="code" className="mt-0 flex-1">
                <CodeView code={generatedCode} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>

      <footer className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
          <p className="pf-kicker">
            Next.js · Tailwind · Vercel AI SDK · GitHub Models
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ---------- pieces ---------- */

function StatusChip({ status }: { status: Status }) {
  const map: Record<Status, { label: string; dot: string }> = {
    idle: { label: "Idle", dot: "bg-muted-foreground/60" },
    forging: { label: "Forging", dot: "bg-ember animate-pulse" },
    ready: { label: "Ready", dot: "bg-ember" },
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
  const base = "pf-tick";
  return (
    <>
      <span className={`${base} left-0 top-0 border-l border-t`} />
      <span className={`${base} right-0 top-0 border-r border-t`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} />
    </>
  );
}

function PreviewCanvas({
  code,
  isGenerating,
}: {
  code: string;
  isGenerating: boolean;
}) {
  return (
    <div className="relative h-full min-h-[20rem] overflow-hidden rounded-md bg-white ring-1 ring-rule">
      {isGenerating && (
        <div className="pf-scan absolute inset-x-0 top-0 z-10 h-px" />
      )}
      {code ? (
        <iframe
          srcDoc={createPreviewDoc(code)}
          className="h-full w-full border-0"
          sandbox="allow-scripts"
          title="Live preview of generated HTML"
        />
      ) : isGenerating ? (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-zinc-400">
            <Loader2 className="size-5 animate-spin" />
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em]">
              Reading pixels
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-zinc-400">
              Output canvas
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              The rendered result appears here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CodeView({ code }: { code: string }) {
  const lines = code ? code.split("\n") : [];
  return (
    <div className="h-full min-h-[20rem] overflow-auto rounded-md bg-[oklch(0.13_0.006_67)] ring-1 ring-rule">
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
          <pre className="flex-1 overflow-x-auto px-4 py-4 text-zinc-300">
            <code>{code}</code>
          </pre>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground/60">
            // markup will stream here
          </p>
        </div>
      )}
    </div>
  );
}

function createPreviewDoc(html: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 1rem; background: #fff; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
}
