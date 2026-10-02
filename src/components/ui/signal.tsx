import { cn } from "@/lib/utils";

export function SignalBar({
  label,
  value,
  trend,
}: {
  label: string;
  value: number | null;
  trend?: "up" | "flat" | "down" | null;
}) {
  const known = typeof value === "number" && !Number.isNaN(value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-display text-sm tabular-nums">
          {known ? `${value!.toFixed(1)}` : "Unknown"}
          {known && trend ? (
            <span
              className={cn(
                "ml-1 text-xs",
                trend === "up" && "text-sage",
                trend === "down" && "text-clay",
                trend === "flat" && "text-muted-foreground",
              )}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
            </span>
          ) : null}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        {known ? (
          <div
            className="h-full rounded-full bg-clay/80 transition-all duration-500"
            style={{ width: `${Math.min(100, (value! / 10) * 100)}%` }}
          />
        ) : (
          <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,var(--color-border)_4px,var(--color-border)_8px)]" />
        )}
      </div>
    </div>
  );
}

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-all duration-200",
        selected
          ? "border-clay bg-clay/12 text-accent-foreground"
          : "border-border bg-card text-ink-soft hover:border-clay/50",
      )}
    >
      {label}
    </button>
  );
}

export function ScoreRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="w-36 shrink-0 text-sm text-ink-soft">{label}</span>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "h-8 w-8 rounded-md border text-xs tabular-nums transition-all",
              value === n
                ? "border-clay bg-clay text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-clay/50",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
