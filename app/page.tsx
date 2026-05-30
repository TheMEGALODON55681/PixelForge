"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Copy, Check, Upload, Sparkles, Loader2, ImageIcon, Maximize2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const stripCodeFences = (code: string): string => {
  return code
    .replace(/^```(?:html|jsx|tsx|javascript|typescript)?\s*\n?/i, "")
    .replace(/\n?```\s*$/, "")
    .trim();
};

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setGeneratedCode("");
  };

  const handleSubmit = () => {
    if (!imageFile) {
      toast.error("Upload a screenshot first");
      return;
    }

    startTransition(async () => {
      try {
        setGeneratedCode("");

        const formData = new FormData();
        formData.append("image", imageFile);

        const response = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to generate code");
        }

        if (!response.body) {
          throw new Error("No response stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setGeneratedCode(stripCodeFences(accumulated));
        }

        toast.success("Code generated");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong";
        toast.error(message);
        console.error(error);
      }
    });
  };

  const handleCopy = async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-500/15 via-purple-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-cyan-500/10 to-transparent blur-3xl" />
      </div>

      <Toaster position="top-right" theme="dark" />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-xs text-zinc-400 backdrop-blur">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            Powered by GPT-4o via GitHub Models
          </div>
          <h1 className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            PixelForge
          </h1>
          <p className="mt-4 text-base text-zinc-400">
            Screenshot in. Production-ready code out.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Upload panel */}
          <Card className="border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Screenshot
            </h2>

            <label
              htmlFor="file-upload"
              className="group relative flex h-80 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/40 transition-all hover:border-zinc-600 hover:bg-zinc-900/70"
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Uploaded screenshot preview"
                  fill
                  className="object-contain p-3 transition-transform group-hover:scale-[1.02]"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="rounded-full border border-zinc-800 bg-zinc-900 p-3 transition-colors group-hover:border-zinc-700 group-hover:bg-zinc-800">
                    <Upload className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      PNG, JPG, WEBP — max 10MB
                    </p>
                  </div>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </label>

            <Button
              onClick={handleSubmit}
              disabled={!imageFile || isPending}
              className="mt-4 w-full bg-white text-zinc-950 hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-500"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Code
                </>
              )}
            </Button>
          </Card>

          {/* Output panel */}
          <Card className="border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
            <Tabs defaultValue="preview" className="w-full">
              <div className="mb-4 flex items-center justify-between gap-2">
                <TabsList className="border border-zinc-800 bg-zinc-900">
                  <TabsTrigger
                    value="preview"
                    className="text-zinc-400 data-[state=active]:bg-white data-[state=active]:text-zinc-900"
                  >
                    Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    className="text-zinc-400 data-[state=active]:bg-white data-[state=active]:text-zinc-900"
                  >
                    Code
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  {/* Fullscreen preview button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!generatedCode}
                        className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                        title="Expand preview"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent
  style={{ maxWidth: "95vw", width: "95vw" }}
  className="h-[92vh] border-zinc-800 bg-zinc-950 p-2 sm:rounded-lg"
>
                      <DialogTitle className="sr-only">Expanded preview</DialogTitle>
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

                  {/* Copy button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!generatedCode}
                    className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-3.5 w-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <TabsContent value="preview" className="mt-0">
                <div className="h-80 overflow-auto rounded-lg border border-zinc-800 bg-white">
                  {isPending && !generatedCode ? (
                    <div className="flex h-full items-center justify-center bg-zinc-50">
                      <div className="flex flex-col items-center gap-3 text-zinc-500">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="text-sm font-medium">Generating preview…</p>
                      </div>
                    </div>
                  ) : generatedCode ? (
                    <iframe
                      srcDoc={createPreviewDoc(generatedCode)}
                      className="h-full w-full border-0"
                      sandbox="allow-scripts"
                      title="Live preview of generated HTML"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-zinc-50">
                      <div className="flex flex-col items-center gap-3 text-zinc-400">
                        <ImageIcon className="h-8 w-8 opacity-50" />
                        <p className="text-sm">Preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-0">
                <pre className="h-80 overflow-auto rounded-lg border border-zinc-800 bg-black/60 p-4 text-xs leading-relaxed text-zinc-300">
                  <code>
                    {generatedCode || "// Your generated code will appear here…"}
                  </code>
                </pre>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-zinc-600">
          Built with Next.js, Tailwind, and GitHub Models
        </footer>
      </div>
    </main>
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
    body { margin: 0; padding: 1rem; background: white; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
}