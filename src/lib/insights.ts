import type { Interaction, InteractionMetric, Person, RealityCheck } from "./data";
import { HEAVY_FEELINGS } from "./inner-circle";

export type Insight = {
  key: string;
  title: string;
  body: string;
  evidence: string[];
  tone: "watch" | "note" | "early";
};

type Input = {
  people: Person[];
  interactions: Interaction[];
  metrics: InteractionMetric[];
  checks: RealityCheck[];
};

function answersOf(check: RealityCheck) {
  return (check.answers ?? {}) as Record<string, string | string[]>;
}

function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Deterministic, rule-based observations. Never diagnoses, never predicts.
 * Each insight carries the evidence lines that produced it.
 */
export function buildInsights({ people, interactions, metrics, checks }: Input): Insight[] {
  const insights: Insight[] = [];
  const byPerson = new Map<string, Person>(people.map((p) => [p.id, p]));
  const metricsByInteraction = new Map<string, InteractionMetric[]>();
  for (const m of metrics) {
    const list = metricsByInteraction.get(m.interaction_id) ?? [];
    list.push(m);
    metricsByInteraction.set(m.interaction_id, list);
  }

  if (interactions.length < 3) {
    insights.push({
      key: "still-early",
      title: "Still early.",
      body: "You don't have enough logged evidence yet to see patterns. That's okay. Keep observing.",
      evidence: [`${interactions.length} interaction${interactions.length === 1 ? "" : "s"} logged so far`],
      tone: "early",
    });
    return insights;
  }

  // 1. Doubts logged, then continued.
  for (const person of people) {
    const theirChecks = checks.filter((c) => c.person_id === person.id);
    const doubt = theirChecks.find((c) => {
      const a = answersOf(c);
      return a["future"] === "No" || a["genuinely_good"] === "No";
    });
    if (!doubt) continue;
    const after = interactions.filter(
      (i) => i.person_id === person.id && new Date(i.created_at) > new Date(doubt.created_at),
    );
    if (after.length >= 2) {
      insights.push({
        key: `doubt-continued-${person.id}`,
        title: "You already had doubts.",
        body: `You've seen ${person.name} ${after.length} more times after logging that this isn't good for you or that you don't see a future. Is there something you're getting from it that keeps you engaged?`,
        evidence: [
          `${person.name}: reality check logged a "no" on ${new Date(doubt.created_at).toLocaleDateString()}`,
          ...after.slice(0, 3).map((i) => `${person.name}: ${i.interaction_type} on ${i.date}`),
        ],
        tone: "watch",
      });
    }
  }

  // 2. High attraction alongside repeated concerns.
  for (const person of people) {
    if (person.relationship_type !== "romantic") continue;
    const theirs = interactions.filter((i) => i.person_id === person.id);
    const highAttraction = theirs.filter((i) =>
      (metricsByInteraction.get(i.id) ?? []).some(
        (m) => m.metric_name === "Attraction" && m.score >= 8,
      ),
    );
    const concerns = theirs.filter((i) => (i.disliked ?? "").trim().length > 0);
    if (highAttraction.length >= 2 && concerns.length >= 2) {
      insights.push({
        key: `chemistry-weight-${person.id}`,
        title: "Chemistry may be getting more weight than compatibility.",
        body: `With ${person.name} you've logged strong attraction ${highAttraction.length} times alongside ${concerns.length} logged concerns. Both are true at once.`,
        evidence: [
          ...highAttraction.slice(0, 2).map((i) => `${person.name}: attraction 8+ on ${i.date}`),
          ...concerns.slice(0, 3).map((i) => `${person.name}, ${i.date}: "${(i.disliked ?? "").slice(0, 80)}"`),
        ],
        tone: "watch",
      });
    }
  }

  // 3. Reasons for continuing.
  const reasonCounts = new Map<string, { count: number; evidence: string[] }>();
  for (const check of checks) {
    const person = byPerson.get(check.person_id);
    for (const reason of asArray(answersOf(check)["getting"])) {
      const entry = reasonCounts.get(reason) ?? { count: 0, evidence: [] };
      entry.count += 1;
      entry.evidence.push(
        `${person?.name ?? "Someone"}: "${reason}" on ${new Date(check.created_at).toLocaleDateString()}`,
      );
      reasonCounts.set(reason, entry);
    }
  }
  for (const key of ["Attention", "Validation", "I don't want to feel alone", "Potential"]) {
    const entry = reasonCounts.get(key);
    if (entry && entry.count >= 2) {
      insights.push({
        key: `reason-${key}`,
        title:
          key === "Potential"
            ? "Potential is showing up a lot."
            : `${key} might be part of the equation.`,
        body: `You've selected "${key}" as something you're getting from a connection ${entry.count} times. Not good or bad. Just useful to know.`,
        evidence: entry.evidence.slice(0, 4),
        tone: "watch",
      });
    }
  }

  // 4. Follow-through concerns.
  const followThrough = interactions.filter((i) =>
    /follow[- ]?through|cancel|flak|didn'?t turn up|late|forgot/i.test(
      `${i.disliked ?? ""} ${i.factual_observations ?? ""}`,
    ),
  );
  if (followThrough.length >= 2) {
    insights.push({
      key: "follow-through",
      title: "Follow-through is becoming a pattern.",
      body: `You've logged ${followThrough.length} instances touching follow-through across ${interactions.length} interactions.`,
      evidence: followThrough
        .slice(0, 4)
        .map(
          (i) =>
            `${byPerson.get(i.person_id)?.name ?? "Someone"}, ${i.date}: "${(i.disliked || i.factual_observations || "").slice(0, 80)}"`,
        ),
      tone: "watch",
    });
  }

  // 5. Heavy feelings vs continuing.
  const heavy = interactions.filter((i) => i.feelings.some((f) => HEAVY_FEELINGS.includes(f)));
  if (heavy.length >= 3) {
    insights.push({
      key: "heavy-feelings",
      title: "Something to watch.",
      body: `${heavy.length} of your ${interactions.length} logged interactions left you feeling anxious, drained, small, judged or obligated.`,
      evidence: heavy
        .slice(0, 4)
        .map(
          (i) =>
            `${byPerson.get(i.person_id)?.name ?? "Someone"}, ${i.date}: ${i.feelings.join(", ")}`,
        ),
      tone: "watch",
    });
  }

  // 6. Nourishment worth noticing.
  const nourishing = people
    .map((p) => {
      const scores = interactions
        .filter((i) => i.person_id === p.id)
        .flatMap((i) => metricsByInteraction.get(i.id) ?? [])
        .filter((m) => m.metric_name === "Emotional safety" || m.metric_name === "Nourishment");
      const avg = scores.length ? scores.reduce((s, m) => s + m.score, 0) / scores.length : 0;
      return { person: p, avg, count: scores.length };
    })
    .filter((x) => x.count >= 2 && x.avg >= 8)
    .sort((a, b) => b.avg - a.avg);
  if (nourishing.length) {
    insights.push({
      key: "nourishing",
      title: "This one is feeding you.",
      body: `${nourishing[0]!.person.name} consistently scores high on safety and nourishment. Worth noticing what that actually feels like.`,
      evidence: nourishing
        .slice(0, 3)
        .map((x) => `${x.person.name}: average ${x.avg.toFixed(1)}/10 across ${x.count} readings`),
      tone: "note",
    });
  }

  return insights;
}

/** Counts for "What tends to keep me around?" */
export function continuingReasonCounts(checks: RealityCheck[]) {
  const counts = new Map<string, number>();
  for (const check of checks) {
    const answers = (check.answers ?? {}) as Record<string, string | string[]>;
    const list = answers["getting"];
    for (const reason of Array.isArray(list) ? list : list ? [list] : []) {
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}
