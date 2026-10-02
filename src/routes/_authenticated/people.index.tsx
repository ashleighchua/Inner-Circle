import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader, Panel } from "@/components/app-shell";
import { Chip } from "@/components/ui/signal";
import { useInteractions, usePeople } from "@/lib/data";
import { ACCESS_LEVELS, STATUSES, labelFor } from "@/lib/inner-circle";

export const Route = createFileRoute("/_authenticated/people/")({
  head: () => ({
    meta: [
      { title: "People — Inner Circle" },
      { name: "description", content: "Everyone you're currently paying attention to." },
      { property: "og:title", content: "People — Inner Circle" },
      { property: "og:description", content: "Everyone you're currently paying attention to." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PeoplePage,
});

const FILTERS = [
  { value: "all", label: "Everyone" },
  { value: "romantic", label: "Romantic" },
  { value: "friendship", label: "Friendship" },
  { value: "exploring", label: "Exploring" },
  { value: "observe", label: "Observe" },
  { value: "ended", label: "Ended" },
];

function PeoplePage() {
  const people = usePeople();
  const interactions = useInteractions();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const list = (people.data ?? []).filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "romantic" || filter === "friendship") return person.relationship_type === filter;
    return person.current_status === filter;
  });

  return (
    <AppShell>
      <PageHeader
        title="People"
        subtitle="Who currently has access, and what you actually know about them."
        action={
          <Link
            to="/people/new"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Add someone
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          className="w-56 rounded-full border border-input bg-paper px-4 py-2 text-sm outline-none focus:border-clay"
        />
        {FILTERS.map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            selected={filter === item.value}
            onClick={() => setFilter(item.value)}
          />
        ))}
      </div>

      {people.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : list.length === 0 ? (
        <Panel>
          <p className="text-sm text-ink-soft">Nobody here yet under this filter.</p>
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((person) => {
            const count = (interactions.data ?? []).filter((i) => i.person_id === person.id).length;
            return (
              <Link
                key={person.id}
                to="/people/$personId"
                params={{ personId: person.id }}
                className="panel block p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-clay/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-2xl leading-none">{person.name}</h2>
                  {person.is_demo ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Demo
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {person.relationship_type === "friendship" ? "Friendship" : "Romantic"} ·{" "}
                  {labelFor(ACCESS_LEVELS, person.access_level)}
                </p>
                <p className="mt-4 line-clamp-2 text-sm text-ink-soft">
                  {person.notes || "No notes yet."}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {count} interaction{count === 1 ? "" : "s"} ·{" "}
                  {labelFor(STATUSES, person.current_status)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
