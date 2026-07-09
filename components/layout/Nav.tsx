'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hammer } from 'lucide-react';
import { scrollToId } from '@/lib/scroll';

function AnchorLink({ id, children }: { id: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  return (
    <Link
      href={`/#${id}`}
      onClick={(e) => {
        if (isLanding) {
          e.preventDefault();
          scrollToId(id);
        }
      }}
      className="hidden font-mono text-[0.8rem] tracking-[0.02em] text-muted-foreground transition-colors hover:text-foreground sm:inline"
    >
      {children}
    </Link>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-heading text-[1.05rem] font-extrabold tracking-tight text-foreground"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-ember shadow-[0_0_12px_rgba(230,74,25,0.4)]">
            <Hammer className="size-3 text-primary-foreground" aria-hidden />
          </span>
          PixelForge
        </Link>

        <nav className="flex items-center gap-6">
          <AnchorLink id="features">Features</AnchorLink>
          <AnchorLink id="specimens">Specimens</AnchorLink>
          <Link
            href="/docs"
            className="hidden font-mono text-[0.8rem] tracking-[0.02em] text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Docs
          </Link>
          <Link
            href="/forge"
            className="rounded-md bg-foreground px-4 py-2 font-mono text-[0.8rem] font-bold uppercase tracking-[0.04em] text-background transition-opacity hover:opacity-90"
          >
            Forge
          </Link>
        </nav>
      </div>
    </header>
  );
}
