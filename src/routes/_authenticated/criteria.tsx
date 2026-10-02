import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader, Panel } from "@/components/app-shell";
import { Chip } from "@/components/ui/signal";
import { supabase } from "@/integrations/supabase/client";
import { useCriteria, useRefresh } from "@/lib/data";
import { CRITERIA_TYPES, DEFAULT_CRITERIA } from "@/lib/inner-circle";

export const Route = createFileRoute("/_authenticated/criteria")({
  head: () => ({
    meta: [
      { title: "Criteria — Inner Circle" },
      { name: "description", content: "What you're actually looking for, in your own words." },
      { property: "og:title", content: "Criteria — Inner Circle" },
      { property: "og:description", content: "What you're actually looking for, in your own words." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CriteriaPage,
});

function CriteriaPage() {
  const criteria = useCriteria();
  const refresh = useRefresh();
  const [name, setName] = useState("");
  const [type, setType] = useState("core");
  const [busy, setBusy] = useState(false);

  const list = criteria.data ?? [];

  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase.from("criteria").insert({ name: name.trim(), type });
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    refresh();
  }

  async function setType_(id: string, value: string) {
    const { error } = await supabase.from("criteria").update({ type: value }).eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("criteria").delete().eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  }

  async function seedDefaults() {
    setBusy(true);
    const { error } = await supabase.from("criteria").insert(DEFAULT_CRITERIA);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      refresh();
      toast.success("Starting list added. Edit it however you like.");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Criteria"
        subtitle="Not a scoring system. A reminder of what you said mattered, before chemistry started talking."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          {CRITERIA_TYPES.map((group) => {
            const items = list.filter((c) => c.type === group.value);
            if (!items.length) return null;
            return (
              <Panel key={group.value}>
                <p className="eyebrow mb-4">{group.label}</p>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm text-foreground">{item.name}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {CRITERIA_TYPES.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setType_(item.id, t.value)}
                            className={
                              t.value === item.type
                                ? "rounded-full border border-clay bg-clay/12 px-2.5 py-1 text-[11px] text-accent-foreground"
                                : "rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:border-clay/50"
                            }
                          >
                            {t.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="px-1.5 text-[11px] text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            );
          })}

          {list.length === 0 ? (
            <Panel>
              <h2 className="font-display text-2xl">Nothing here yet.</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Start from your own list, or load the one you already wrote down.
              </p>
              <button
                type="button"
                onClick={seedDefaults}
                disabled={busy}
                className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
              >
                {busy ? "Adding…" : "Load my starting list"}
              </button>
            </Panel>
          ) : null}
        </div>

        <Panel className="h-fit space-y-4">
          <p className="eyebrow">Add a criterion</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Follow-through"
            className="w-full rounded-lg border border-input bg-paper px-3 py-2.5 text-sm outline-none focus:border-clay"
          />
          <div className="flex flex-wrap gap-2">
            {CRITERIA_TYPES.map((t) => (
              <Chip
                key={t.value}
                label={t.label}
                selected={type === t.value}
                onClick={() => setType(t.value)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={add}
            className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
          >
            Add
          </button>
          <p className="text-xs text-muted-foreground">
            Core, preference, watch, dealbreaker — you decide which, and you can change it any time.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
