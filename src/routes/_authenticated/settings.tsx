import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader, Panel } from "@/components/app-shell";
import { usePeople, useRefresh } from "@/lib/data";
import { deleteDemoData, loadDemoData } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Inner Circle" },
      { name: "description", content: "Sample data and account settings for your journal." },
      { property: "og:title", content: "Settings — Inner Circle" },
      { property: "og:description", content: "Sample data and account settings for your journal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const people = usePeople();
  const refresh = useRefresh();
  const [busy, setBusy] = useState(false);
  const hasDemo = (people.data ?? []).some((p) => p.is_demo);

  async function run(action: () => Promise<void>, message: string) {
    setBusy(true);
    try {
      await action();
      refresh();
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Your journal is private to your account." />

      <div className="max-w-2xl space-y-6">
        <Panel className="space-y-4">
          <div>
            <h2 className="font-display text-2xl">Sample data</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Four fictional people so the screens have something to show. Clearly marked
              &ldquo;Demo&rdquo; everywhere, and removable in one click.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || hasDemo}
              onClick={() => run(loadDemoData, "Sample data loaded.")}
              className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-50"
            >
              {hasDemo ? "Already loaded" : "Load sample data"}
            </button>
            <button
              type="button"
              disabled={busy || !hasDemo}
              onClick={() => run(deleteDemoData, "Sample data removed.")}
              className="rounded-full border border-input px-5 py-2.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              Delete sample data
            </button>
          </div>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl">What this app will never do</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
            <li>Give anyone a compatibility score.</li>
            <li>Rank people.</li>
            <li>Predict whether something will work.</li>
            <li>Diagnose you or anyone else.</li>
            <li>Tell you who to date.</li>
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
