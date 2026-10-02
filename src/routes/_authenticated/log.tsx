import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader, Panel } from "@/components/app-shell";
import { Chip, ScoreRow } from "@/components/ui/signal";
import { RealityCheck } from "@/components/reality-check";
import { supabase } from "@/integrations/supabase/client";
import { usePeople, useRefresh } from "@/lib/data";
import { FEELINGS, INTERACTION_TYPES, QUICK_METRICS } from "@/lib/inner-circle";

type Search = { personId?: string | undefined };

export const Route = createFileRoute("/_authenticated/log")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    personId: typeof search["personId"] === "string" ? search["personId"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Log an interaction — Inner Circle" },
      { name: "description", content: "Capture what actually happened in under a minute." },
      { property: "og:title", content: "Log an interaction — Inner Circle" },
      { property: "og:description", content: "Capture what actually happened in under a minute." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LogPage,
});

const field =
  "w-full rounded-lg border border-input bg-paper px-3 py-2.5 text-sm outline-none focus:border-clay";

function LogPage() {
  const { personId: initialPerson } = Route.useSearch();
  const navigate = useNavigate();
  const people = usePeople();
  const refresh = useRefresh();

  const [personId, setPersonId] = useState(initialPerson ?? "");
  const [type, setType] = useState("date");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [feelings, setFeelings] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState("");
  const [disliked, setDisliked] = useState("");
  const [facts, setFacts] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<{ interactionId: string; personId: string } | null>(null);

  const person = (people.data ?? []).find((p) => p.id === personId);
  const metricNames =
    QUICK_METRICS[person?.relationship_type === "friendship" ? "friendship" : "romantic"];

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!personId) {
      toast.error("Pick who this was with.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("interactions")
      .insert({
        person_id: personId,
        interaction_type: type,
        date,
        feelings,
        liked: liked || null,
        disliked: disliked || null,
        factual_observations: facts || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      setBusy(false);
      toast.error(error?.message ?? "Couldn't save");
      return;
    }

    const rows = Object.entries(scores).map(([metric_name, score]) => ({
      interaction_id: data.id,
      metric_name,
      score,
    }));
    if (rows.length) await supabase.from("interaction_metrics").insert(rows);

    setBusy(false);
    refresh();
    toast.success("Logged.");
    setSaved({ interactionId: data.id, personId });
  }

  if (saved && person) {
    return (
      <AppShell>
        <PageHeader
          title="Logged."
          subtitle="One optional reflection while it's fresh — or skip and move on."
        />
        <div className="max-w-3xl">
          <RealityCheck
            personId={saved.personId}
            interactionId={saved.interactionId}
            relationshipType={person.relationship_type}
            onDone={() => navigate({ to: "/people/$personId", params: { personId: saved.personId } })}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Log an interaction" subtitle="Fast. Factual. Thirty seconds is enough." />

      {(people.data ?? []).length === 0 ? (
        <Panel>
          <p className="text-sm text-ink-soft">
            Add someone first, then you can log what happened.{" "}
            <Link to="/people/new" className="text-clay underline-offset-4 hover:underline">
              Add someone
            </Link>
          </p>
        </Panel>
      ) : (
        <form onSubmit={save} className="max-w-3xl space-y-6">
          <Panel className="space-y-5">
            <div className="space-y-2">
              <label className="eyebrow">Who?</label>
              <div className="flex flex-wrap gap-2">
                {(people.data ?? []).map((p) => (
                  <Chip
                    key={p.id}
                    label={p.name}
                    selected={personId === p.id}
                    onClick={() => setPersonId(p.id)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="eyebrow">What happened?</label>
              <div className="flex flex-wrap gap-2">
                {INTERACTION_TYPES.map((item) => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    selected={type === item.value}
                    onClick={() => setType(item.value)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">When</label>
              <input
                type="date"
                className="w-48 rounded-lg border border-input bg-paper px-3 py-2 text-sm outline-none focus:border-clay"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </Panel>

          <Panel className="space-y-3">
            <label className="eyebrow">How did I feel?</label>
            <div className="flex flex-wrap gap-2">
              {FEELINGS.map((feeling) => (
                <Chip
                  key={feeling}
                  label={feeling}
                  selected={feelings.includes(feeling)}
                  onClick={() =>
                    setFeelings((prev) =>
                      prev.includes(feeling)
                        ? prev.filter((f) => f !== feeling)
                        : [...prev, feeling],
                    )
                  }
                />
              ))}
            </div>
          </Panel>

          <Panel className="space-y-4">
            <div>
              <label className="eyebrow">Quick signals</label>
              <p className="mt-1 text-xs text-muted-foreground">
                Leave any blank. Unknown is a valid answer.
              </p>
            </div>
            {metricNames.map((name) => (
              <ScoreRow
                key={name}
                label={name}
                value={scores[name] ?? 0}
                onChange={(value) => setScores((prev) => ({ ...prev, [name]: value }))}
              />
            ))}
          </Panel>

          <Panel className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">What did I like?</label>
              <textarea rows={2} className={field} value={liked} onChange={(e) => setLiked(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">What didn't I like?</label>
              <textarea
                rows={2}
                className={field}
                value={disliked}
                onChange={(e) => setDisliked(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">
                What actually happened? — facts only, no conclusions
              </label>
              <textarea
                rows={3}
                className={field}
                placeholder="He arrived 25 minutes late and didn't mention it."
                value={facts}
                onChange={(e) => setFacts(e.target.value)}
              />
            </div>
          </Panel>

          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save interaction"}
          </button>
        </form>
      )}
    </AppShell>
  );
}
