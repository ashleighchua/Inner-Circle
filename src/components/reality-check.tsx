import { useState } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/app-shell";
import { Chip } from "@/components/ui/signal";
import { supabase } from "@/integrations/supabase/client";
import { useRefresh } from "@/lib/data";
import { CONTINUING_REASONS, FEELINGS, FRIENDSHIP_REASONS } from "@/lib/inner-circle";

type Answers = Record<string, string | string[]>;

const ROMANTIC_QUESTIONS: { key: string; question: string; options: string[]; multi?: boolean }[] = [
  {
    key: "attracted_to",
    question: "Am I attracted to this person, or attracted to being wanted?",
    options: ["Them", "Being wanted", "Both", "Not sure", "Not relevant"],
  },
  {
    key: "like_or_potential",
    question: "Do I like this person, or do I like their potential?",
    options: ["Them", "Their potential", "Both", "Not sure"],
  },
  {
    key: "certain_liked",
    question: "If I knew for certain that this person liked me, would I still want them?",
    options: ["Yes", "No", "Not sure"],
  },
  {
    key: "chemistry_overlook",
    question: "Am I overlooking something because of chemistry?",
    options: ["No", "Maybe", "Yes"],
  },
  {
    key: "genuinely_good",
    question: "Am I continuing because this is genuinely good for me?",
    options: ["Yes", "No", "Not sure"],
  },
  {
    key: "future",
    question: "Do I see a future here?",
    options: ["Yes", "No", "Not sure", "Too early"],
  },
  {
    key: "getting",
    question: "Or because I like something I'm getting from it?",
    options: CONTINUING_REASONS,
    multi: true,
  },
];

const FRIENDSHIP_QUESTIONS: { key: string; question: string; options: string[]; multi?: boolean }[] =
  [
    {
      key: "enjoy_friendship",
      question: "Do I genuinely enjoy this friendship?",
      options: ["Yes", "Mostly", "Not really", "Not sure"],
    },
    {
      key: "after_feeling",
      question: "How do I feel after spending time with her?",
      options: FEELINGS,
    },
    {
      key: "why_maintain",
      question: "Why am I maintaining this friendship?",
      options: FRIENDSHIP_REASONS,
      multi: true,
    },
    {
      key: "getting",
      question: "What am I getting from it?",
      options: CONTINUING_REASONS,
      multi: true,
    },
  ];

export function RealityCheck({
  personId,
  interactionId,
  relationshipType,
  onDone,
}: {
  personId: string;
  interactionId?: string;
  relationshipType: string;
  onDone?: () => void;
}) {
  const refresh = useRefresh();
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const questions = relationshipType === "friendship" ? FRIENDSHIP_QUESTIONS : ROMANTIC_QUESTIONS;

  function pick(key: string, value: string, multi?: boolean) {
    setAnswers((prev) => {
      if (!multi) return { ...prev, [key]: prev[key] === value ? "" : value };
      const current = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("reality_checks").insert({
      person_id: personId,
      interaction_id: interactionId ?? null,
      answers,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
    toast.success("Saved. Nothing to conclude from it yet.");
    setAnswers({});
    onDone?.();
  }

  return (
    <Panel className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">The Reality Check</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Optional, and skippable. You already know what happened — the question is whether you're
          negotiating with yourself.
        </p>
      </div>

      {questions.map((q) => (
        <div key={q.key} className="space-y-2">
          <p className="text-sm text-foreground">{q.question}</p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((option) => {
              const current = answers[q.key];
              const selected = q.multi
                ? Array.isArray(current) && current.includes(option)
                : current === option;
              return (
                <Chip
                  key={option}
                  label={option}
                  selected={selected}
                  onClick={() => pick(q.key, option, q.multi)}
                />
              );
            })}
          </div>
        </div>
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">
            What evidence do I have that this person is actually compatible with me?
          </label>
          <textarea
            rows={3}
            value={(answers["evidence_compatible"] as string) ?? ""}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, evidence_compatible: e.target.value }))
            }
            className="w-full rounded-lg border border-input bg-paper px-3 py-2.5 text-sm outline-none focus:border-clay"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">
            What am I imagining that has not actually happened?
          </label>
          <textarea
            rows={3}
            value={(answers["imagining"] as string) ?? ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, imagining: e.target.value }))}
            className="w-full rounded-lg border border-input bg-paper px-3 py-2.5 text-sm outline-none focus:border-clay"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          disabled={busy || Object.keys(answers).length === 0}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save reflection"}
        </button>
        <button
          type="button"
          onClick={() => onDone?.()}
          className="rounded-full border border-input px-5 py-2.5 text-sm text-muted-foreground hover:bg-muted"
        >
          Skip
        </button>
      </div>
    </Panel>
  );
}
