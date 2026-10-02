import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Inner Circle — understand who you let in" },
      {
        name: "description",
        content:
          "A private relationship journal built on evidence, not potential. Log what actually happened, notice your own patterns, keep the decision yours.",
      },
      { property: "og:title", content: "Inner Circle — understand who you let in" },
      {
        property: "og:description",
        content:
          "A private relationship journal built on evidence, not potential. Log what actually happened, notice your own patterns.",
      },
    ],
  }),
  component: Landing,
});

const PRINCIPLES = [
  "Evidence over potential.",
  "Connection over intensity.",
  "Patterns over isolated incidents.",
  "Observation before interpretation.",
  "Slow is allowed.",
  "Access is a choice.",
];

function Landing() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
      else setChecked(true);
    });
  }, [navigate]);

  if (!checked) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-20">
        <p className="eyebrow">A private relationship journal</p>
        <h1 className="mt-4 font-display text-6xl leading-[1.05]">Inner Circle</h1>
        <p className="mt-5 max-w-xl text-lg text-ink-soft">
          Understand who you let in. Understand why.
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Log what actually happened. Separate it from the story you're telling yourself. Watch
          your own patterns emerge over time. No scores, no verdicts — you stay the one deciding.
        </p>

        <ul className="mt-10 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {PRINCIPLES.map((line) => (
            <li key={line} className="font-display text-lg text-foreground/80">
              {line}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Link
            to="/auth"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open your journal
          </Link>
          <span className="text-xs text-muted-foreground">Private to you. Nobody else sees it.</span>
        </div>
      </div>
    </div>
  );
}
