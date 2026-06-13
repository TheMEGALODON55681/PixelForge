'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import type { PixelForgeSource } from '@/hooks/usePixelForge';

interface UploadDropzoneProps {
  source: PixelForgeSource | null;
  onFileSelect: (file: File) => void;
  onLoadExample: () => void;
}

export function UploadDropzone({ source, onFileSelect, onLoadExample }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
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
        if (file) onFileSelect(file);
      }}
      className={`group relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-dashed transition-colors ${
        isDragging
          ? 'border-ember bg-primary/5'
          : 'border-rule bg-background/40 hover:border-ember/50 hover:bg-background/70'
      }`}
    >
      {source ? (
        <Image
          src={source.url}
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
            <p className="text-sm font-medium">Drop, paste, or click to upload</p>
            <p className="mt-1 font-mono text-[0.7rem] text-muted-foreground">
              PNG · JPG · WEBP — up to 10MB
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLoadExample();
              }}
              className="pf-kicker mt-2 text-ember underline-offset-2 hover:underline"
            >
              Try with an example
            </button>
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
          if (file) onFileSelect(file);
          e.target.value = '';
        }}
      />
    </label>
  );
}
