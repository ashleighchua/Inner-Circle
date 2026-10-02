import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader, Panel } from "@/components/app-shell";
import { InsightCard } from "@/components/insight-card";
import { SignalBar } from "@/components/ui/signal";
import {
  useInsightFeedback,
  useInteractions,
  useMetrics,
  usePeople,
  useRealityChecks,
} from "@/lib/data";
import { buildInsights } from "@/lib/insights";
import { summariseSignal } from "@/lib/signals";
import { ACCESS_LEVELS, QUICK_METRICS, STATUSES, labelFor } from "@/lib/inner-circle";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Home — Inner Circle" },
      { name: "description", content: "Your current relationships, signals and emerging patterns." },
      { property: "og:title", content: "Home — Inner Circle" },
      { property: "og:description", content: "Your current relationships, signals and emerging patterns." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const people = usePeople();
  const interactions = useInteractions();
  const metrics = useMetrics();
  const checks = useRealityChecks();
  const feedback = useInsightFeedback();

  const loading =
    people.isLoading || interactions.isLoading || metrics.isLoading || checks.isLoading;

  const allPeople = people.data ?? [];
  const allInteractions = interactions.data ?? [];
  const allMetrics = metrics.data ?? [];
  const insights = buildInsights({
    people: allPeople,
    interactions: allInteractions,
    metrics: allMetrics,
    checks: checks.data ?? [],
  });
  const feedbackMap = new Map((feedback.data ?? []).map((f) => [f.insight_key, f.feedback]));

  const active = allPeople.filter((p) => p.current_status !== "ended");

  return (
    <AppShell>
      <PageHeader
        title="Inner Circle"
        subtitle="Understand who you let in. Understand why."
        action={
          <div className="flex gap-2">
            <Link
              to="/log"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Log an interaction
            </Link>
            <Link
              to="/people/new"
              className="rounded-full border border-input bg-card px-5 py-2.5 text-sm transition-colors hover:bg-muted"
            >
              Add someone
            </Link>
          </div>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Opening your journal…</p>
      ) : allPeople.length === 0 ? (
        <Panel className="text-center">
          <h2 className="font-display text-2xl">Nothing logged yet.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Start with one person. You don't need to know how you feel about them yet — that's the
            point.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link
              to="/people/new"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Add someone
            </Link>
            <Link
              to="/settings"
              className="rounded-full border border-input px-5 py-2.5 text-sm hover:bg-muted"
            >
              Or load sample data
            </Link>
          </div>
        </Panel>
      ) : (
        <div className="space-y-12">
          <section>
            <h2 className="eyebrow mb-4">Current relationships</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {active.map((person) => {
                const theirs = allInteractions.filter((i) => i.person_id === person.id);
                const names = QUICK_METRICS[
                  person.relationship_type === "friendship" ? "friendship" : "romantic"
                ];
                return (
                  <Link
                    key={person.id}
                    to="/people/$personId"
                    params={{ personId: person.id }}
                    className="panel block p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-clay/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-2xl leading-none">{person.name}</h3>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {person.relationship_type === "friendship" ? "Friendship" : "Romantic"} ·{" "}
                          {labelFor(ACCESS_LEVELS, person.access_level)}
                        </p>
                      </div>
                      {person.is_demo ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          Demo
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 text-xs text-ink-soft">
                      {theirs.length} interaction{theirs.length === 1 ? "" : "s"} ·{" "}
                      {labelFor(STATUSES, person.current_status)}
                    </p>

                    <div className="mt-5 space-y-3">
                      {names.slice(0, 4).map((name) => {
                        const summary = summariseSignal(name, theirs, allMetrics);
                        return (
                          <SignalBar
                            key={name}
                            label={name}
                            value={summary.average}
                            trend={summary.trend}
                          />
                        );
                      })}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="eyebrow mb-1">Emerging patterns</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Observations, not diagnoses. Every one shows its evidence.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {insights.map((insight) => (
                <InsightCard
                  key={insight.key}
                  insight={insight}
                  feedback={feedbackMap.get(insight.key)}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="eyebrow mb-4">Relationship landscape</h2>
            <Panel className="overflow-x-auto p-0">
              <table className="w-full min-w-150 text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Person</th>
                    {["Connection", "Attraction", "Emotional safety", "Effort", "Nourishment"].map(
                      (name) => (
                        <th
                          key={name}
                          className="px-5 py-3 text-xs font-medium text-muted-foreground"
                        >
                          {name}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {active.map((person) => {
                    const theirs = allInteractions.filter((i) => i.person_id === person.id);
                    return (
                      <tr key={person.id} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-3">
                          <Link
                            to="/people/$personId"
                            params={{ personId: person.id }}
                            className="font-display text-lg hover:text-clay"
                          >
                            {person.name}
                          </Link>
                        </td>
                        {["Connection", "Attraction", "Emotional safety", "Effort", "Nourishment"].map(
                          (name) => {
                            const summary = summariseSignal(name, theirs, allMetrics);
                            return (
                              <td key={name} className="px-5 py-3 tabular-nums">
                                {summary.average === null ? (
                                  <span className="text-xs text-muted-foreground">Unknown</span>
                                ) : (
                                  <span>
                                    {summary.average.toFixed(1)}
                                    <span
                                      className={
                                        summary.trend === "up"
                                          ? "ml-1 text-sage"
                                          : summary.trend === "down"
                                            ? "ml-1 text-clay"
                                            : "ml-1 text-muted-foreground"
                                      }
                                    >
                                      {summary.trend === "up"
                                        ? "↑"
                                        : summary.trend === "down"
                                          ? "↓"
                                          : summary.trend === "flat"
                                            ? "→"
                                            : ""}
                                    </span>
                                  </span>
                                )}
                              </td>
                            );
                          },
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Panel>
          </section>
        </div>
      )}
    </AppShell>
  );
}
