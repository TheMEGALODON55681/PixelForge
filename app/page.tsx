"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        const formData = new FormData();
        formData.append("image", imageFile);

        const response = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate code");
        }

        const data = await response.json();
        setGeneratedCode(data.code);
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
    <main className="min-h-screen bg-background">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">PixelForge</h1>
          <p className="mt-2 text-muted-foreground">
            Screenshot in. Production-ready code out.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Upload panel */}
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Screenshot
            </h2>

            <label
              htmlFor="file-upload"
              className="relative flex h-72 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/60"
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Uploaded screenshot preview"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG, WEBP — max 10MB
                  </p>
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
              className="mt-4 w-full"
              size="lg"
            >
              {isPending ? "Generating…" : "Generate Code"}
            </Button>
          </Card>

          {/* Output panel */}
          <Card className="p-6">
            <Tabs defaultValue="preview" className="w-full">
              <div className="mb-4 flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!generatedCode}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </Button>
              </div>

              <TabsContent value="preview" className="mt-0">
                <div className="h-72 overflow-auto rounded-lg border bg-white">
                  {generatedCode ? (
                    <iframe
                      srcDoc={createPreviewDoc(generatedCode)}
                      className="h-full w-full border-0"
                      sandbox="allow-scripts"
                      title="Live preview of generated HTML"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Preview will appear here once code is generated
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-0">
                <pre className="h-72 overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
                  <code>
                    {generatedCode || "// Your generated code will appear here…"}
                  </code>
                </pre>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
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