import type { Interaction, InteractionMetric } from "./data";

export type SignalSummary = {
  name: string;
  average: number | null;
  trend: "up" | "flat" | "down" | null;
};

/**
 * Average + trend for one metric across a person's interactions.
 * Trend compares the most recent reading to the average of the earlier ones.
 */
export function summariseSignal(
  name: string,
  interactions: Interaction[],
  metrics: InteractionMetric[],
): SignalSummary {
  const ordered = [...interactions].sort((a, b) => a.date.localeCompare(b.date));
  const scores: number[] = [];
  for (const interaction of ordered) {
    const match = metrics.find((m) => m.interaction_id === interaction.id && m.metric_name === name);
    if (match) scores.push(match.score);
  }
  if (!scores.length) return { name, average: null, trend: null };
  const average = scores.reduce((s, n) => s + n, 0) / scores.length;
  let trend: SignalSummary["trend"] = null;
  if (scores.length >= 3) {
    const latest = scores[scores.length - 1]!;
    const earlier = scores.slice(0, -1);
    const earlierAvg = earlier.reduce((s, n) => s + n, 0) / earlier.length;
    const delta = latest - earlierAvg;
    trend = delta > 0.6 ? "up" : delta < -0.6 ? "down" : "flat";
  }
  return { name, average, trend };
}

export function seriesFor(
  name: string,
  interactions: Interaction[],
  metrics: InteractionMetric[],
) {
  return [...interactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((interaction) => {
      const match = metrics.find(
        (m) => m.interaction_id === interaction.id && m.metric_name === name,
      );
      return { date: interaction.date, value: match?.score ?? null };
    })
    .filter((point) => point.value !== null);
}
