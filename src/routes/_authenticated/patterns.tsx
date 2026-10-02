import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { AppShell, PageHeader, Panel } from "@/components/app-shell";
import { InsightCard } from "@/components/insight-card";
import {
  useInsightFeedback,
  useInteractions,
  useMetrics,
  usePeople,
  useRealityChecks,
} from "@/lib/data";
import { buildInsights, continuingReasonCounts } from "@/lib/insights";
import { HEAVY_FEELINGS, NOURISHING_FEELINGS } from "@/lib/inner-circle";

export const Route = createFileRoute("/_authenticated/patterns")({
  head: () => ({
    meta: [
      { title: "Patterns — Inner Circle" },
      { name: "description", content: "What tends to keep you around, and what you repeat." },
      { property: "og:title", content: "Patterns — Inner Circle" },
      { property: "og:description", content: "What tends to keep you around, and what you repeat." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Patterns,
});

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 11 };

function Patterns() {
  const people = usePeople();
  const interactions = useInteractions();
  const metrics = useMetrics();
  const checks = useRealityChecks();
  const feedback = useInsightFeedback();

  const allInteractions = interactions.data ?? [];
  const allMetrics = metrics.data ?? [];
  const allChecks = checks.data ?? [];
  const feedbackMap = new Map((feedback.data ?? []).map((f) => [f.insight_key, f.feedback]));

  const score = (interactionId: string, name: string) =>
    allMetrics.find((m) => m.interaction_id === interactionId && m.metric_name === name)?.score ??
    null;

  const ordered = [...allInteractions].sort((a, b) => a.date.localeCompare(b.date));

  const overTime = ordered.map((i) => ({
    date: i.date,
    Attraction: score(i.id, "Attraction"),
    Connection: score(i.id, "Connection"),
    Safety: score(i.id, "Emotional safety"),
  }));

  const scatter = ordered
    .map((i) => ({
      attraction: score(i.id, "Attraction"),
      connection: score(i.id, "Connection"),
      safety: score(i.id, "Emotional safety"),
    }))
    .filter((p) => p.attraction !== null && p.connection !== null);

  const reasons = continuingReasonCounts(allChecks);

  const behaviour = [
    {
      label: "Logged feeling nourished",
      count: allInteractions.filter((i) => i.feelings.some((f) => NOURISHING_FEELINGS.includes(f)))
        .length,
    },
    {
      label: "Logged feeling anxious, drained or small",
      count: allInteractions.filter((i) => i.feelings.some((f) => HEAVY_FEELINGS.includes(f))).length,
    },
    {
      label: "Logged a concern",
      count: allInteractions.filter((i) => (i.disliked ?? "").trim().length > 0).length,
    },
    {
      label: "Logged a factual observation",
      count: allInteractions.filter((i) => (i.factual_observations ?? "").trim().length > 0).length,
    },
    {
      label: "Said 'no' or 'not sure' in a reality check",
      count: allChecks.filter((c) => {
        const a = c.answers as Record<string, unknown>;
        return a["future"] === "No" || a["genuinely_good"] === "No";
      }).length,
    },
    {
      label: "Named potential as what I'm getting",
      count: allChecks.filter((c) => {
        const a = c.answers as Record<string, unknown>;
        const list = Array.isArray(a["getting"]) ? (a["getting"] as string[]) : [];
        return list.includes("Potential") || list.includes("Hope");
      }).length,
    },
  ];

  const insights = buildInsights({
    people: people.data ?? [],
    interactions: allInteractions,
    metrics: allMetrics,
    checks: allChecks,
  });

  const enough = allInteractions.length >= 3;

  return (
    <AppShell>
      <PageHeader
        title="Patterns"
        subtitle="This screen is about you, not about ranking anyone. Only shown when there's data behind it."
      />

      {!enough ? (
        <Panel>
          <h2 className="font-display text-2xl">Not enough yet.</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Log a few more interactions and patterns will start to appear here. You don't know yet —
            that's an honest answer.
          </p>
        </Panel>
      ) : (
        <div className="space-y-10">
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight) => (
              <InsightCard
                key={insight.key}
                insight={insight}
                feedback={feedbackMap.get(insight.key)}
              />
            ))}
          </div>

          <Panel>
            <h2 className="font-display text-2xl">Attraction, connection and safety over time</h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Across everyone. Chemistry is information, not instruction.
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overTime}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" tick={axis} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={axis} tickLine={false} width={28} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="Attraction" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} connectNulls />
                  <Line type="monotone" dataKey="Connection" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} connectNulls />
                  <Line type="monotone" dataKey="Safety" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel>
              <h2 className="font-display text-2xl">Intensity vs connection</h2>
              <p className="mt-1 mb-6 text-sm text-muted-foreground">
                Each dot is one logged interaction. Not everything intense is meaningful.
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid stroke="var(--color-border)" />
                    <XAxis
                      type="number"
                      dataKey="attraction"
                      name="Attraction"
                      domain={[0, 10]}
                      tick={axis}
                      tickLine={false}
                    />
                    <YAxis
                      type="number"
                      dataKey="connection"
                      name="Connection"
                      domain={[0, 10]}
                      tick={axis}
                      tickLine={false}
                      width={28}
                    />
                    <ZAxis range={[60, 60]} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Scatter data={scatter} fill="var(--color-chart-1)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel>
              <h2 className="font-display text-2xl">What tends to keep me around?</h2>
              <p className="mt-1 mb-6 text-sm text-muted-foreground">
                Not good or bad. Just useful to know.
              </p>
              {reasons.length === 0 ? (
                <p className="text-sm text-ink-soft">
                  No reality checks logged yet, so there's nothing to show.
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reasons} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid stroke="var(--color-border)" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={axis} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="reason"
                        tick={axis}
                        tickLine={false}
                        width={120}
                      />
                      <Tooltip
                        cursor={{ fill: "var(--color-muted)" }}
                        contentStyle={{
                          background: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" fill="var(--color-chart-1)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>
          </div>

          <Panel>
            <h2 className="font-display text-2xl">My own behaviour</h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Trends, not judgments. These are counts of what you've logged.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {behaviour.map((row) => (
                <li
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-2"
                >
                  <span className="text-sm text-ink-soft">{row.label}</span>
                  <span className="font-display text-2xl tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
