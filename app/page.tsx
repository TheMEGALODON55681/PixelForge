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
  Download,
  RotateCw,
  History,
  Monitor,
  Tablet,
  Smartphone,
  Keyboard,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Status = "idle" | "forging" | "ready";
type Framework = "html" | "jsx";
type DeviceWidth = "desktop" | "tablet" | "mobile";

interface HistoryEntry {
  id: string;
  imageFile: File;
  imagePreview: string;
  imageMeta: { w: number; h: number } | null;
  generatedCode: string;
  timestamp: number;
  bytes: number;
}

interface ShortcutItem {
  keys: string[];
  action: string;
}

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

const formatTimestamp = (ts: number): string => {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  return `${Math.floor(seconds / 3600)} hr ago`;
};

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_HISTORY = 10;

const SHORTCUTS: ShortcutItem[] = [
  { keys: ["Ctrl+V"], action: "Paste image from clipboard" },
  { keys: ["Ctrl+Enter"], action: "Forge / re-forge code" },
  { keys: ["Ctrl+C"], action: "Copy generated code" },
  { keys: ["Ctrl+S"], action: "Download generated code" },
  { keys: ["Ctrl+H"], action: "Toggle history drawer" },
  { keys: ["Ctrl+/"], action: "Show keyboard shortcuts" },
  { keys: ["Esc"], action: "Close any open dialog or panel" },
];

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
  const [framework, setFramework] = useState<Framework>("html");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [deviceWidth, setDeviceWidth] = useState<DeviceWidth>("desktop");
  const [activeTab, setActiveTab] = useState("preview");
  const [isMac, setIsMac] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const historyObjectUrlsRef = useRef<Map<string, string>>(new Map());

  // Detect Mac vs non-Mac for keyboard-shortcut display. This must run on the
  // client only (navigator is undefined during SSR), so the initial render uses
  // the SSR-safe default (false) and we correct it after mount. Setting state in
  // this effect is intentional and avoids a hydration mismatch — the alternative
  // (reading navigator in a lazy initializer) would desync server vs client HTML.
  useEffect(() => {
    // navigator.userAgentData is not yet in the TS DOM lib; narrow it locally.
    const uaData = (
      navigator as Navigator & {
        userAgentData?: { platform?: string };
      }
    ).userAgentData;
    const platform = navigator.platform || uaData?.platform || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMac(platform.toLowerCase().includes("mac"));
  }, []);

  // Format shortcut key for display (⌘ on Mac, Ctrl on non-Mac)
  const modKey = isMac ? "⌘" : "Ctrl";

  // Revoke any object URL we created so blob previews don't leak.
  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Revoke a history entry's object URL
  const revokeHistoryUrl = useCallback((id: string) => {
    const url = historyObjectUrlsRef.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      historyObjectUrlsRef.current.delete(id);
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

  const addToHistory = useCallback(
    (
      file: File,
      preview: string,
      meta: { w: number; h: number } | null,
      code: string,
    ) => {
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        imageFile: file,
        imagePreview: preview,
        imageMeta: meta,
        generatedCode: code,
        timestamp: Date.now(),
        bytes: new TextEncoder().encode(code).length,
      };

      // Store the object URL reference for cleanup
      historyObjectUrlsRef.current.set(entry.id, preview);

      setHistory((prev) => {
        const next = [entry, ...prev];
        // Evict oldest if exceeding MAX_HISTORY
        if (next.length > MAX_HISTORY) {
          const evicted = next.pop()!;
          // Revoke the evicted entry's object URL after a tick to ensure it's not in use
          setTimeout(() => revokeHistoryUrl(evicted.id), 0);
        }
        return next;
      });
    },
    [revokeHistoryUrl],
  );

  const restoreHistoryEntry = useCallback(
    (entry: HistoryEntry) => {
      releaseObjectUrl();
      setImageFile(entry.imageFile);
      setImagePreview(entry.imagePreview);
      setImageMeta(entry.imageMeta);
      setGeneratedCode(entry.generatedCode);
      objectUrlRef.current = entry.imagePreview;
      setHistoryOpen(false);
      toast.success("Restored generation from history");
    },
    [releaseObjectUrl],
  );

  const handleSubmit = useCallback(
    async (frameworkOverride?: Framework) => {
      const fw = frameworkOverride || framework;
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
        formData.append("framework", fw);

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

        const finalCode = stripCodeFences(accumulated);
        setGeneratedCode(finalCode);

        // Add to history after successful generation
        addToHistory(imageFile, imagePreview!, imageMeta, finalCode);

        toast.success("Forged", { description: "Code is ready to copy" });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
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
    },
    [imageFile, framework, imagePreview, imageMeta, addToHistory],
  );

  const handleForgeAgain = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

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

  const handleDownload = useCallback(() => {
    if (!generatedCode) return;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const ext = framework === "jsx" ? "jsx" : "html";
    const filename = `pixelforge-${timestamp}.${ext}`;

    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded", { description: filename });
  }, [generatedCode, framework]);

  // Load example screenshot
  const loadExample = useCallback(async () => {
    try {
      const response = await fetch("/example.png");
      if (!response.ok) throw new Error("Failed to load example");
      const blob = await response.blob();
      const file = new File([blob], "example.png", { type: blob.type });
      acceptFile(file);
      toast.success("Example loaded");
    } catch {
      toast.error("Couldn't load the example screenshot");
    }
  }, [acceptFile]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Don't fire shortcuts when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // Ctrl+/ or Cmd+/ — show shortcuts panel
      if (ctrl && e.key === "/") {
        e.preventDefault();
        setShortcutsOpen((open) => !open);
        return;
      }

      // Esc — close any open dialog/panel
      if (e.key === "Escape") {
        setShortcutsOpen(false);
        setHistoryOpen(false);
        return;
      }

      // Ctrl+H or Cmd+H — toggle history drawer
      if (ctrl && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setHistoryOpen((open) => !open);
        return;
      }

      // Ctrl+Enter or Cmd+Enter — forge / re-forge
      if (ctrl && e.key === "Enter") {
        e.preventDefault();
        if (imageFile && !isGenerating) {
          handleSubmit();
        }
        return;
      }

      // Ctrl+C or Cmd+C — copy generated code
      if (ctrl && e.key.toLowerCase() === "c" && generatedCode) {
        // Only intercept if no text is selected (avoid breaking normal copy)
        const selection = window.getSelection()?.toString() || "";
        if (!selection) {
          e.preventDefault();
          handleCopy();
        }
        return;
      }

      // Ctrl+S or Cmd+S — download generated code
      if (ctrl && e.key.toLowerCase() === "s" && generatedCode) {
        e.preventDefault();
        handleDownload();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSubmit, handleCopy, handleDownload, imageFile, isGenerating, generatedCode]);

  // Cleanup on unmount: cancel stream + revoke blob URLs + revoke history URLs.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      releaseObjectUrl();
      // Revoke all history object URLs
      historyObjectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      historyObjectUrlsRef.current.clear();
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

  const deviceWidthPx = useMemo(() => {
    switch (deviceWidth) {
      case "mobile":
        return 375;
      case "tablet":
        return 768;
      default:
        return null; // full width
    }
  }, [deviceWidth]);

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              disabled={history.length === 0}
              className="hidden font-mono text-[0.68rem] uppercase tracking-[0.18em] sm:inline-flex"
            >
              <History className="mr-1.5 size-3.5" />
              History ({history.length})
            </Button>
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
                    {!imageFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          loadExample();
                        }}
                        className="pf-kicker mt-2 text-ember underline-offset-2 hover:underline"
                      >
                        Try with an example
                      </button>
                    )}
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
              onClick={() => handleSubmit()}
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
                {modKey}V
              </kbd>{" "}
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
              {/* Output controls row */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                  </TabsList>

                  {/* Framework toggle */}
                  <TabsList>
                    <TabsTrigger
                      value="html"
                      data-state={framework === "html" ? "active" : "inactive"}
                      onClick={() => setFramework("html")}
                    >
                      HTML
                    </TabsTrigger>
                    <TabsTrigger
                      value="jsx"
                      data-state={framework === "jsx" ? "active" : "inactive"}
                      onClick={() => setFramework("jsx")}
                    >
                      JSX
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {/* Telemetry — separate row on mobile, inline on sm+ */}
                  {(generatedCode || isGenerating) && (
                    <span className="whitespace-nowrap font-mono text-[0.7rem] text-muted-foreground sm:order-1">
                      {formatBytes(telemetry.bytes)} · {telemetry.lines} ln
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 sm:order-2">
                    {/* Device width toggle — only visible in Preview tab */}
                    {activeTab === "preview" && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant={deviceWidth === "desktop" ? "outline" : "ghost"}
                          size="icon-sm"
                          onClick={() => setDeviceWidth("desktop")}
                          aria-label="Desktop width"
                          className="size-8"
                        >
                          <Monitor className="size-4" />
                        </Button>
                        <Button
                          variant={deviceWidth === "tablet" ? "outline" : "ghost"}
                          size="icon-sm"
                          onClick={() => setDeviceWidth("tablet")}
                          aria-label="Tablet width"
                          className="size-8"
                        >
                          <Tablet className="size-4" />
                        </Button>
                        <Button
                          variant={deviceWidth === "mobile" ? "outline" : "ghost"}
                          size="icon-sm"
                          onClick={() => setDeviceWidth("mobile")}
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
                          disabled={!generatedCode}
                          aria-label="Expand preview to fullscreen"
                          className="size-8"
                        >
                          <Maximize2 className="size-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="h-[90vh] w-full border-rule bg-background p-2 sm:h-[92vh] sm:max-w-[95vw] sm:rounded-lg">
                        <DialogTitle className="sr-only">
                          Expanded preview
                        </DialogTitle>
                        <div className="h-full w-full overflow-hidden rounded-md bg-white">
                          {generatedCode ? (
                            <iframe
                              srcDoc={createPreviewDoc(generatedCode, deviceWidthPx)}
                              className="mx-auto h-full border-0"
                              style={
                                deviceWidthPx
                                  ? { width: `${deviceWidthPx}px` }
                                  : { width: "100%" }
                              }
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
                      onClick={handleForgeAgain}
                      disabled={!imageFile || isGenerating}
                    >
                      <RotateCw className="size-4" />
                      <span className="hidden sm:inline">Forge again</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={handleDownload}
                      disabled={!generatedCode}
                      aria-label="Download code"
                      className="size-8"
                    >
                      <Download className="size-4" />
                    </Button>

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
                  deviceWidthPx={deviceWidthPx}
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

      {/* History Drawer */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent
          className="fixed right-0 top-0 h-full w-full max-w-sm translate-x-0 translate-y-0 rounded-none border-l border-rule bg-background p-0 sm:max-w-sm"
        >
          <DialogTitle className="sr-only">History</DialogTitle>
          <div className="flex h-full flex-col">
            <div className="flex items-center border-b border-rule px-5 py-4 pr-14">
              <h2 className="pf-kicker">History</h2>
            </div>

            <div className="flex-1 overflow-auto p-5">
              {history.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <History className="size-8 opacity-30" />
                  <p className="pf-kicker text-center">No generations yet</p>
                  <p className="text-center text-xs opacity-60">
                    Generated code will appear here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex gap-3 rounded-md border border-rule bg-card p-3"
                    >
                      <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded bg-background">
                        <Image
                          src={entry.imagePreview}
                          alt="Screenshot thumbnail"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="font-mono text-[0.7rem] text-muted-foreground">
                            {formatTimestamp(entry.timestamp)}
                          </p>
                          <p className="font-mono text-[0.68rem] text-muted-foreground">
                            {formatBytes(entry.bytes)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreHistoryEntry(entry)}
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

      {/* Keyboard Shortcuts Panel */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="pf-frame max-w-sm border-rule bg-background p-0">
          <DialogTitle className="sr-only">Keyboard Shortcuts</DialogTitle>
          <div className="flex items-center border-b border-rule px-5 py-4 pr-14">
            <h2 className="pf-kicker">Keyboard Shortcuts</h2>
          </div>
          <div className="p-5">
            <table className="w-full">
              <tbody className="divide-y divide-rule">
                {SHORTCUTS.map((shortcut) => (
                  <tr key={shortcut.action} className="flex items-center justify-between py-2.5">
                    <td className="text-sm text-muted-foreground">
                      {shortcut.action}
                    </td>
                    <td className="flex gap-1">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="rounded border border-rule bg-card px-1.5 py-0.5 font-mono text-[0.65rem]"
                        >
                          {key.replace("Ctrl", modKey).replace("+/", "+/")}
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
  deviceWidthPx,
}: {
  code: string;
  isGenerating: boolean;
  deviceWidthPx: number | null;
}) {
  return (
    <div className="relative h-full min-h-[20rem] overflow-hidden rounded-md bg-white ring-1 ring-rule sm:min-h-[28rem]">
      {/* Device width label */}
      {deviceWidthPx && (
        <div className="absolute left-0 right-0 top-0 z-10 flex justify-center py-1">
          <span className="pf-kicker text-ember">
            {deviceWidthPx} × auto
          </span>
        </div>
      )}
      {isGenerating && (
        <div className="pf-scan absolute inset-x-0 top-0 z-10 h-px" />
      )}
      {code ? (
        <div className="flex h-full justify-center">
          <iframe
            srcDoc={createPreviewDoc(code, deviceWidthPx)}
            className="h-full border-0"
            style={
              deviceWidthPx
                ? { width: `${deviceWidthPx}px`, marginTop: "1.5rem" }
                : { width: "100%" }
            }
            sandbox="allow-scripts"
            title="Live preview of generated HTML"
          />
        </div>
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
          <pre className="flex-1 overflow-x-auto px-4 py-4 text-zinc-300">
            <code>{code}</code>
          </pre>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground/60">
            {"// markup will stream here"}
          </p>
        </div>
      )}
    </div>
  );
}

function createPreviewDoc(html: string, deviceWidthPx?: number | null): string {
  const viewportMeta = deviceWidthPx
    ? `<meta name="viewport" content="width=${deviceWidthPx}, initial-scale=1.0" />`
    : `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  ${viewportMeta}
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
