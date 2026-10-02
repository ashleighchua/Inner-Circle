import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Person = Database["public"]["Tables"]["people"]["Row"];
export type Interaction = Database["public"]["Tables"]["interactions"]["Row"];
export type InteractionMetric = Database["public"]["Tables"]["interaction_metrics"]["Row"];
export type Evidence = Database["public"]["Tables"]["evidence"]["Row"];
export type Criterion = Database["public"]["Tables"]["criteria"]["Row"];
export type Decision = Database["public"]["Tables"]["decisions"]["Row"];
export type RealityCheck = Database["public"]["Tables"]["reality_checks"]["Row"];
export type RealityStory = Database["public"]["Tables"]["reality_story"]["Row"];
export type InsightFeedback = Database["public"]["Tables"]["insight_feedback"]["Row"];

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export function usePeople() {
  return useQuery({
    queryKey: ["people"],
    queryFn: async () =>
      unwrap<Person[]>(
        await supabase.from("people").select("*").order("created_at", { ascending: false }),
      ),
  });
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: ["person", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("people").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return data as Person | null;
    },
  });
}

export function useInteractions(personId?: string) {
  return useQuery({
    queryKey: ["interactions", personId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("interactions").select("*").order("date", { ascending: false });
      if (personId) q = q.eq("person_id", personId);
      return unwrap<Interaction[]>(await q);
    },
  });
}

export function useMetrics() {
  return useQuery({
    queryKey: ["interaction_metrics"],
    queryFn: async () =>
      unwrap<InteractionMetric[]>(await supabase.from("interaction_metrics").select("*")),
  });
}

export function useEvidence(personId?: string) {
  return useQuery({
    queryKey: ["evidence", personId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("evidence").select("*").order("created_at", { ascending: false });
      if (personId) q = q.eq("person_id", personId);
      return unwrap<Evidence[]>(await q);
    },
  });
}

export function useCriteria() {
  return useQuery({
    queryKey: ["criteria"],
    queryFn: async () =>
      unwrap<Criterion[]>(
        await supabase.from("criteria").select("*").order("created_at", { ascending: true }),
      ),
  });
}

export function useDecisions(personId?: string) {
  return useQuery({
    queryKey: ["decisions", personId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("decisions").select("*").order("date", { ascending: false });
      if (personId) q = q.eq("person_id", personId);
      return unwrap<Decision[]>(await q);
    },
  });
}

export function useRealityChecks(personId?: string) {
  return useQuery({
    queryKey: ["reality_checks", personId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("reality_checks").select("*").order("created_at", { ascending: false });
      if (personId) q = q.eq("person_id", personId);
      return unwrap<RealityCheck[]>(await q);
    },
  });
}

export function useRealityStories(personId?: string) {
  return useQuery({
    queryKey: ["reality_story", personId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("reality_story").select("*").order("created_at", { ascending: false });
      if (personId) q = q.eq("person_id", personId);
      return unwrap<RealityStory[]>(await q);
    },
  });
}

export function useInsightFeedback() {
  return useQuery({
    queryKey: ["insight_feedback"],
    queryFn: async () =>
      unwrap<InsightFeedback[]>(await supabase.from("insight_feedback").select("*")),
  });
}

/** Invalidate everything — these screens all read from each other. */
export function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}

export function useSaveInsightFeedback() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async ({ key, feedback }: { key: string; feedback: string }) => {
      const { error } = await supabase
        .from("insight_feedback")
        .upsert({ insight_key: key, feedback }, { onConflict: "user_id,insight_key" });
      if (error) throw new Error(error.message);
    },
    onSuccess: refresh,
  });
}
