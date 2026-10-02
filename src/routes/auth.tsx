import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Inner Circle" },
      { name: "description", content: "Sign in to your private Inner Circle journal." },
      { property: "og:title", content: "Sign in — Inner Circle" },
      { property: "og:description", content: "Sign in to your private Inner Circle journal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          return;
        }
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in didn't work. Try email instead.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="panel w-full max-w-md p-8">
        <h1 className="font-display text-3xl">Inner Circle</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {mode === "signin" ? "Welcome back." : "Make your private journal."}
        </p>

        {sent ? (
          <p className="mt-6 rounded-lg bg-accent p-4 text-sm text-accent-foreground">
            Check your email to confirm your address, then come back and sign in.
          </p>
        ) : (
          <>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-paper px-3 py-2.5 text-sm outline-none focus:border-clay"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-paper px-3 py-2.5 text-sm outline-none focus:border-clay"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={google}
              className="w-full rounded-full border border-input bg-card px-5 py-2.5 text-sm transition-colors hover:bg-muted"
            >
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-6 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {mode === "signin"
                ? "No account yet? Create one"
                : "Already have an account? Sign in"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
