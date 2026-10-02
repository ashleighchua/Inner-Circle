-- PEOPLE
CREATE TABLE public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  relationship_type text NOT NULL DEFAULT 'romantic',
  photo_url text,
  date_met date,
  how_met text,
  age integer,
  occupation text,
  location text,
  access_level text NOT NULL DEFAULT 'getting_to_know',
  current_status text NOT NULL DEFAULT 'exploring',
  notes text,
  unknowns text,
  signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.people TO authenticated;
GRANT ALL ON public.people TO service_role;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own people" ON public.people FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- INTERACTIONS
CREATE TABLE public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  interaction_type text NOT NULL DEFAULT 'date',
  date date NOT NULL DEFAULT current_date,
  feelings text[] NOT NULL DEFAULT '{}',
  liked text,
  disliked text,
  factual_observations text,
  notes text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interactions TO authenticated;
GRANT ALL ON public.interactions TO service_role;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own interactions" ON public.interactions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX interactions_person_idx ON public.interactions(person_id, date DESC);

-- INTERACTION METRICS
CREATE TABLE public.interaction_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  interaction_id uuid NOT NULL REFERENCES public.interactions(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  score integer NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interaction_metrics TO authenticated;
GRANT ALL ON public.interaction_metrics TO service_role;
ALTER TABLE public.interaction_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own metrics" ON public.interaction_metrics FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX interaction_metrics_interaction_idx ON public.interaction_metrics(interaction_id);

-- EVIDENCE
CREATE TABLE public.evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  interaction_id uuid REFERENCES public.interactions(id) ON DELETE SET NULL,
  category text,
  observation text NOT NULL,
  interpretation text,
  feeling text,
  significance text NOT NULL DEFAULT 'small',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence TO authenticated;
GRANT ALL ON public.evidence TO service_role;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own evidence" ON public.evidence FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CRITERIA
CREATE TABLE public.criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'romantic',
  type text NOT NULL DEFAULT 'core',
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.criteria TO authenticated;
GRANT ALL ON public.criteria TO service_role;
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own criteria" ON public.criteria FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DECISIONS
CREATE TABLE public.decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  decision text NOT NULL,
  reason text,
  evidence text,
  date date NOT NULL DEFAULT current_date,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decisions TO authenticated;
GRANT ALL ON public.decisions TO service_role;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own decisions" ON public.decisions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- REALITY CHECKS (post-interaction reflection answers)
CREATE TABLE public.reality_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  interaction_id uuid REFERENCES public.interactions(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reality_checks TO authenticated;
GRANT ALL ON public.reality_checks TO service_role;
ALTER TABLE public.reality_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reality checks" ON public.reality_checks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- REALITY VS STORY
CREATE TABLE public.reality_story (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  what_happened text,
  story text,
  what_i_know text,
  what_i_dont_know text,
  next_step text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reality_story TO authenticated;
GRANT ALL ON public.reality_story TO service_role;
ALTER TABLE public.reality_story ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reality story" ON public.reality_story FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- INSIGHT FEEDBACK
CREATE TABLE public.insight_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  insight_key text NOT NULL,
  feedback text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, insight_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insight_feedback TO authenticated;
GRANT ALL ON public.insight_feedback TO service_role;
ALTER TABLE public.insight_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own insight feedback" ON public.insight_feedback FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
