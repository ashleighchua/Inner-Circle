import { useState } from "react";
import { toast } from "sonner";
import type { Insight } from "@/lib/insights";
import { useSaveInsightFeedback } from "@/lib/data";
import { cn } from "@/lib/utils";

export function InsightCard({ insight, feedback }: { insight: Insight; feedback?: string | undefined }) {
  const [open, setOpen] = useState(false);
  const save = useSaveInsightFeedback();

  if (feedback === "dismissed") return null;

  function react(value: string) {
    save.mutate(
      { key: insight.key, feedback: value },
      { onSuccess: () => toast.success("Noted. Thank you.") },
    );
  }

  return (
    <article
      className={cn(
        "panel p-5",
        insight.tone === "watch" && "border-clay/40",
        insight.tone === "early" && "border-dashed",
      )}
    >
      <h3 className="font-display text-xl">{insight.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{insight.body}</p>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-4 text-xs text-clay underline-offset-4 hover:underline"
      >
        {open ? "Hide the evidence" : "Why am I seeing this?"}
      </button>
      {open ? (
        <ul className="mt-3 space-y-1.5 border-l-2 border-border pl-4">
          {insight.evidence.map((line, index) => (
            <li key={index} className="text-xs text-muted-foreground">
              {line}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          { value: "useful", label: "Useful" },
          { value: "inaccurate", label: "Not accurate" },
          { value: "more_evidence", label: "Need more evidence" },
          { value: "dismissed", label: "Dismiss" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => react(option.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              feedback === option.value
                ? "border-clay bg-clay/12 text-accent-foreground"
                : "border-border text-muted-foreground hover:border-clay/50",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </article>
  );
}
