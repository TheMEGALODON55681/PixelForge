interface CodePanelProps {
  code: string;
}

export function CodePanel({ code }: CodePanelProps) {
  const lines = code ? code.split('\n') : [];
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
            {'// markup will stream here'}
          </p>
        </div>
      )}
    </div>
  );
}
