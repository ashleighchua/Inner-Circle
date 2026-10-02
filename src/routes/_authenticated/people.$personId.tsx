import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel } from "@/components/app-shell";
import { Chip, SignalBar } from "@/components/ui/signal";
import { RealityCheck } from "@/components/reality-check";
import { supabase } from "@/integrations/supabase/client";
import type { Interaction, InteractionMetric } from "@/lib/data";
import {
  useDecisions,
  useEvidence,
  useInteractions,
  useMetrics,
  usePerson,
  useRealityChecks,
  useRealityStories,
  useRefresh,
} from "@/lib/data";
import { summariseSignal } from "@/lib/signals";
import {
  ACCESS_LEVELS,
  INTERACTION_TYPES,
  NEXT_STEPS,
  PROFILE_SIGNALS,
  SIGNIFICANCE,
  STATUSES,
  labelFor,
} from "@/lib/inner-circle";

export const Route = createFileRoute("/_authenticated/people/$personId")({
  head: () => ({
    meta: [
      { title: "Profile — Inner Circle" },
      { name: "description", content: "Everything you've actually observed about this person." },
      { property: "og:title", content: "Profile — Inner Circle" },
      { property: "og:description", content: "Everything you've actually observed about this person." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PersonProfile,
});

const field =
  "w-full rounded-lg border border-input bg-paper px-3 py-2.5 text-sm outline-none focus:border-clay";

function PersonProfile() {
  const { personId } = Route.useParams();
  const navigate = useNavigate();
  const refresh = useRefresh();
  const person = usePerson(personId);
  const interactions = useInteractions(personId);
  const metrics = useMetrics();
  const evidence = useEvidence(personId);
  const decisions = useDecisions(personId);
  const checks = useRealityChecks(personId);
  const stories = useRealityStories(personId);

  const [notes, setNotes] = useState("");
  const [unknowns, setUnknowns] = useState("");
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (person.data) {
      setNotes(person.data.notes ?? "");
      setUnknowns(person.data.unknowns ?? "");
    }
  }, [person.data]);

  if (person.isLoading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }
  if (!person.data) {
    return (
      <AppShell>
        <Panel>
          <p className="text-sm text-ink-soft">That person isn't here.</p>
        </Panel>
      </AppShell>
    );
  }

  const p = person.data;
  const theirs = interactions.data ?? [];
  const allMetrics = metrics.data ?? [];
  const signalNames = PROFILE_SIGNALS[p.relationship_type === "friendship" ? "friendship" : "romantic"];

  async function update(patch: Record<string, unknown>) {
    const { error } = await supabase
      .from("people")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", personId);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
    toast.success("Saved.");
  }

  async function remove() {
    const { error } = await supabase.from("people").delete().eq("id", personId);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
    navigate({ to: "/people" });
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            {p.relationship_type === "friendship" ? "Friendship" : "Romantic"}
            {p.how_met ? ` · met ${p.how_met.toLowerCase()}` : ""}
          </p>
          <h1 className="mt-2 font-display text-5xl">{p.name}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {[p.occupation, p.location, p.date_met ? `met ${p.date_met}` : null]
              .filter(Boolean)
              .join(" · ") || "No details yet."}
          </p>
        </div>
        <Link
          to="/log"
          search={{ personId }}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Log an interaction
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel className="space-y-5">
            <div className="space-y-2">
              <p className="eyebrow">Access — how much do I choose to give?</p>
              <div className="flex flex-wrap gap-2">
                {ACCESS_LEVELS.map((level) => (
                  <Chip
                    key={level.value}
                    label={level.label}
                    selected={p.access_level === level.value}
                    onClick={() => update({ access_level: level.value })}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {ACCESS_LEVELS.find((l) => l.value === p.access_level)?.note}
              </p>
            </div>
            <div className="space-y-2">
              <p className="eyebrow">Where I'm at</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <Chip
                    key={status.value}
                    label={status.label}
                    selected={p.current_status === status.value}
                    onClick={() => update({ current_status: status.value })}
                  />
                ))}
              </div>
            </div>
          </Panel>

          <Panel className="space-y-5">
            <div className="space-y-1.5">
              <p className="eyebrow">What I know</p>
              <textarea
                rows={4}
                className={field}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => notes !== (p.notes ?? "") && update({ notes })}
              />
            </div>
            <div className="space-y-1.5">
              <p className="eyebrow">What I don't know yet</p>
              <p className="text-xs text-muted-foreground">Unknown isn't bad. It's just unknown.</p>
              <textarea
                rows={3}
                className={field}
                value={unknowns}
                onChange={(e) => setUnknowns(e.target.value)}
                onBlur={() => unknowns !== (p.unknowns ?? "") && update({ unknowns })}
              />
            </div>
          </Panel>

          <Timeline interactions={theirs} metrics={allMetrics} />

          <EvidenceSection personId={personId} evidence={evidence.data ?? []} onSaved={refresh} />

          <RealityStorySection
            personId={personId}
            stories={stories.data ?? []}
            onSaved={refresh}
          />

          <DecisionSection
            personId={personId}
            decisions={decisions.data ?? []}
            onSaved={refresh}
          />
        </div>

        <div className="space-y-6">
          <Panel>
            <p className="eyebrow mb-4">Signals from what you've logged</p>
            <div className="space-y-4">
              {signalNames.map((name) => {
                const summary = summariseSignal(name, theirs, allMetrics);
                const override = (p.signals as Record<string, number> | null)?.[name];
                return (
                  <SignalBar
                    key={name}
                    label={name}
                    value={typeof override === "number" ? override : summary.average}
                    trend={summary.trend}
                  />
                );
              })}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Averages of what you logged, not a verdict. Blank means you haven't observed it yet.
            </p>
          </Panel>

          <Panel>
            <p className="eyebrow mb-3">Reality check</p>
            {showCheck ? (
              <div className="-m-6">
                <RealityCheck
                  personId={personId}
                  relationshipType={p.relationship_type}
                  onDone={() => setShowCheck(false)}
                />
              </div>
            ) : (
              <>
                <p className="text-sm text-ink-soft">
                  {(checks.data ?? []).length} reflection
                  {(checks.data ?? []).length === 1 ? "" : "s"} logged.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCheck(true)}
                  className="mt-4 rounded-full border border-input px-4 py-2 text-sm hover:bg-muted"
                >
                  Run one now
                </button>
              </>
            )}
          </Panel>

          <Panel>
            <p className="eyebrow mb-3">Remove</p>
            <p className="text-sm text-ink-soft">
              Deleting removes this person and everything logged about them.
            </p>
            <button
              type="button"
              onClick={remove}
              className="mt-4 rounded-full border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              Delete {p.name}
            </button>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function Timeline({
  interactions,
  metrics,
}: {
  interactions: Interaction[];
  metrics: InteractionMetric[];
}) {
  if (!interactions.length) {
    return (
      <Panel>
        <p className="eyebrow mb-3">Timeline</p>
        <p className="text-sm text-ink-soft">Nothing logged yet. The timeline is the foundation.</p>
      </Panel>
    );
  }
  return (
    <Panel>
      <p className="eyebrow mb-5">Timeline</p>
      <ol className="space-y-7 border-l border-border pl-6">
        {interactions.map((interaction) => {
          const theirMetrics = metrics.filter((m) => m.interaction_id === interaction.id);
          return (
            <li key={interaction.id} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border border-clay bg-background" />
              <p className="font-display text-xl">
                {labelFor(INTERACTION_TYPES, interaction.interaction_type)}{" "}
                <span className="text-base text-muted-foreground">— {interaction.date}</span>
              </p>
              {interaction.feelings.length ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {interaction.feelings.join(" · ")}
                </p>
              ) : null}
              {interaction.factual_observations ? (
                <p className="mt-3 text-sm text-foreground">{interaction.factual_observations}</p>
              ) : null}
              {interaction.liked ? (
                <p className="mt-2 text-sm text-ink-soft">
                  <span className="text-muted-foreground">Liked: </span>
                  {interaction.liked}
                </p>
              ) : null}
              {interaction.disliked ? (
                <p className="mt-1 text-sm text-ink-soft">
                  <span className="text-muted-foreground">Didn't like: </span>
                  {interaction.disliked}
                </p>
              ) : null}
              {theirMetrics.length ? (
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                  {theirMetrics.map((m) => (
                    <span key={m.metric_name} className="text-xs text-muted-foreground">
                      {m.metric_name}{" "}
                      <span className="font-display text-sm text-foreground">{m.score}/10</span>
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

function EvidenceSection({
  personId,
  evidence,
  onSaved,
}: {
  personId: string;
  evidence: { id: string; observation: string; interpretation: string | null; feeling: string | null; significance: string; created_at: string }[];
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [observation, setObservation] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [feeling, setFeeling] = useState("");
  const [significance, setSignificance] = useState("small");

  async function save() {
    if (!observation.trim()) return;
    const { error } = await supabase
      .from("evidence")
      .insert({ person_id: personId, observation, interpretation, feeling, significance });
    if (error) {
      toast.error(error.message);
      return;
    }
    setObservation("");
    setInterpretation("");
    setFeeling("");
    setOpen(false);
    onSaved();
    toast.success("Logged as evidence.");
  }

  return (
    <Panel className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Behaviour & evidence</p>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-xs text-clay underline-offset-4 hover:underline"
        >
          {open ? "Cancel" : "Log something"}
        </button>
      </div>

      {open ? (
        <div className="space-y-3 rounded-lg bg-muted/50 p-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">What happened? — factual</label>
            <textarea rows={2} className={field} value={observation} onChange={(e) => setObservation(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">What did I interpret it as?</label>
            <textarea rows={2} className={field} value={interpretation} onChange={(e) => setInterpretation(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">How did it make me feel?</label>
            <input className={field} value={feeling} onChange={(e) => setFeeling(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">How significant does it feel?</label>
            <div className="flex flex-wrap gap-2">
              {SIGNIFICANCE.map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  selected={significance === item.value}
                  onClick={() => setSignificance(item.value)}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Save evidence
          </button>
        </div>
      ) : null}

      {evidence.length === 0 ? (
        <p className="text-sm text-ink-soft">Nothing logged. Observation before interpretation.</p>
      ) : (
        <ul className="space-y-4">
          {evidence.map((item) => (
            <li key={item.id} className="border-l-2 border-clay/40 pl-4">
              <p className="text-sm text-foreground">{item.observation}</p>
              {item.interpretation ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  I told myself: {item.interpretation}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {[item.feeling, labelFor(SIGNIFICANCE, item.significance)].filter(Boolean).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function RealityStorySection({
  personId,
  stories,
  onSaved,
}: {
  personId: string;
  stories: {
    id: string;
    what_happened: string | null;
    story: string | null;
    what_i_know: string | null;
    what_i_dont_know: string | null;
    next_step: string | null;
  }[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    what_happened: "",
    story: "",
    what_i_know: "",
    what_i_dont_know: "",
    next_step: "",
  });

  async function save() {
    if (!form.what_happened.trim() && !form.story.trim()) return;
    const { error } = await supabase.from("reality_story").insert({ person_id: personId, ...form });
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm({ what_happened: "", story: "", what_i_know: "", what_i_dont_know: "", next_step: "" });
    onSaved();
    toast.success("Saved.");
  }

  return (
    <Panel className="space-y-5">
      <div>
        <p className="eyebrow">Reality vs Story</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The app never assumes your interpretation is true.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">What happened?</label>
          <textarea
            rows={3}
            className={field}
            value={form.what_happened}
            onChange={(e) => setForm({ ...form, what_happened: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">What I'm telling myself</label>
          <textarea
            rows={3}
            className={field}
            value={form.story}
            onChange={(e) => setForm({ ...form, story: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">What do I actually know?</label>
          <textarea
            rows={2}
            className={field}
            value={form.what_i_know}
            onChange={(e) => setForm({ ...form, what_i_know: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">What don't I know?</label>
          <textarea
            rows={2}
            className={field}
            value={form.what_i_dont_know}
            onChange={(e) => setForm({ ...form, what_i_dont_know: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">What could I do next?</label>
        <div className="flex flex-wrap gap-2">
          {NEXT_STEPS.map((step) => (
            <Chip
              key={step}
              label={step}
              selected={form.next_step === step}
              onClick={() => setForm({ ...form, next_step: form.next_step === step ? "" : step })}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={save}
        className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
      >
        Save
      </button>

      {stories.length ? (
        <ul className="space-y-4 border-t border-border pt-5">
          {stories.map((entry) => (
            <li key={entry.id} className="grid gap-2 sm:grid-cols-2">
              <p className="text-sm text-foreground">{entry.what_happened}</p>
              <p className="text-sm text-muted-foreground">{entry.story}</p>
              {entry.next_step ? (
                <p className="text-xs text-clay sm:col-span-2">Next: {entry.next_step}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}

function DecisionSection({
  personId,
  decisions,
  onSaved,
}: {
  personId: string;
  decisions: { id: string; decision: string; reason: string | null; evidence: string | null; date: string }[];
  onSaved: () => void;
}) {
  const [decision, setDecision] = useState("");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");

  async function save() {
    if (!decision) return;
    const { error } = await supabase
      .from("decisions")
      .insert({ person_id: personId, decision, reason, evidence });
    if (error) {
      toast.error(error.message);
      return;
    }
    setDecision("");
    setReason("");
    setEvidence("");
    onSaved();
    toast.success("Recorded. Still your call.");
  }

  return (
    <Panel className="space-y-5">
      <div>
        <p className="eyebrow">Decision</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Nothing is calculated here. You decide; the app just remembers why.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <Chip
            key={status.value}
            label={status.label}
            selected={decision === status.label}
            onClick={() => setDecision(decision === status.label ? "" : status.label)}
          />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Why?</label>
          <textarea rows={2} className={field} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">What evidence led me here?</label>
          <textarea rows={2} className={field} value={evidence} onChange={(e) => setEvidence(e.target.value)} />
        </div>
      </div>
      <button
        type="button"
        onClick={save}
        className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
      >
        Record decision
      </button>

      {decisions.length ? (
        <ul className="space-y-3 border-t border-border pt-5">
          {decisions.map((item) => (
            <li key={item.id}>
              <p className="font-display text-lg">
                {item.decision} <span className="text-sm text-muted-foreground">— {item.date}</span>
              </p>
              {item.reason ? <p className="text-sm text-ink-soft">{item.reason}</p> : null}
              {item.evidence ? (
                <p className="text-xs text-muted-foreground">Evidence: {item.evidence}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}
