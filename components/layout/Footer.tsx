import Link from 'next/link';
import { Hammer } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-rule bg-secondary">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 sm:px-8">
        <span className="flex items-center gap-1.5 font-heading text-[1.05rem] font-extrabold tracking-tight text-foreground/50">
          <Hammer className="size-4" aria-hidden />
          PixelForge
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/docs"
            className="font-mono text-[0.75rem] tracking-[0.02em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </Link>
          <Link
            href="/forge"
            className="font-mono text-[0.75rem] tracking-[0.02em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Forge
          </Link>
          <span className="font-mono text-[0.7rem] text-muted-foreground/60">
            © 2026 PixelForge
          </span>
        </div>
      </div>
    </footer>
  );
}
