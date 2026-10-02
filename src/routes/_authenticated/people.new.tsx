import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader, Panel } from "@/components/app-shell";
import { Chip } from "@/components/ui/signal";
import { supabase } from "@/integrations/supabase/client";
import { useRefresh } from "@/lib/data";
import { ACCESS_LEVELS, RELATIONSHIP_TYPES } from "@/lib/inner-circle";

export const Route = createFileRoute("/_authenticated/people/new")({
  head: () => ({
    meta: [
      { title: "Add someone — Inner Circle" },
      { name: "description", content: "Add a new person to your journal in under a minute." },
      { property: "og:title", content: "Add someone — Inner Circle" },
      { property: "og:description", content: "Add a new person to your journal in under a minute." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AddPerson,
});

const field =
  "w-full rounded-lg border border-input bg-paper px-3 py-2.5 text-sm outline-none focus:border-clay";

function AddPerson() {
  const navigate = useNavigate();
  const refresh = useRefresh();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    relationship_type: "romantic",
    access_level: "getting_to_know",
    how_met: "",
    date_met: "",
    occupation: "",
    location: "",
    age: "",
    notes: "",
    unknowns: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("people")
      .insert({
        name: form.name.trim(),
        relationship_type: form.relationship_type,
        access_level: form.access_level,
        how_met: form.how_met || null,
        date_met: form.date_met || null,
        occupation: form.occupation || null,
        location: form.location || null,
        age: form.age ? Number(form.age) : null,
        notes: form.notes || null,
        unknowns: form.unknowns || null,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "Couldn't save");
      return;
    }
    refresh();
    toast.success(`${form.name.trim()} added.`);
    navigate({ to: "/people/$personId", params: { personId: data.id } });
  }

  return (
    <AppShell>
      <PageHeader title="Add someone" subtitle="A minute is enough. You can fill the rest in later." />
      <form onSubmit={save} className="max-w-2xl space-y-6">
        <Panel className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Name</label>
            <input
              className={field}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Relationship type</label>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_TYPES.map((type) => (
                <Chip
                  key={type.value}
                  label={type.label}
                  selected={form.relationship_type === type.value}
                  onClick={() => set("relationship_type", type.value)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              How much access do I currently choose to give?
            </label>
            <div className="flex flex-wrap gap-2">
              {ACCESS_LEVELS.map((level) => (
                <Chip
                  key={level.value}
                  label={level.label}
                  selected={form.access_level === level.value}
                  onClick={() => set("access_level", level.value)}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {ACCESS_LEVELS.find((l) => l.value === form.access_level)?.note}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">How we met</label>
              <input
                className={field}
                value={form.how_met}
                onChange={(e) => set("how_met", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Date met</label>
              <input
                type="date"
                className={field}
                value={form.date_met}
                onChange={(e) => set("date_met", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Occupation (optional)</label>
              <input
                className={field}
                value={form.occupation}
                onChange={(e) => set("occupation", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Location (optional)</label>
              <input
                className={field}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
          </div>
        </Panel>

        <Panel className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">What I know</label>
            <textarea
              rows={3}
              className={field}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">
              What I don't know yet — unknown isn't bad
            </label>
            <textarea
              rows={3}
              className={field}
              placeholder="Conflict style — unknown."
              value={form.unknowns}
              onChange={(e) => set("unknowns", e.target.value)}
            />
          </div>
        </Panel>

        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </form>
    </AppShell>
  );
}
