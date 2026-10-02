import { supabase } from "@/integrations/supabase/client";

type DemoInteraction = {
  type: string;
  daysAgo: number;
  feelings: string[];
  liked?: string;
  disliked?: string;
  facts?: string;
  metrics: Record<string, number>;
  check?: Record<string, string | string[]>;
};

type DemoPerson = {
  name: string;
  relationship_type: string;
  how_met: string;
  occupation: string;
  location: string;
  access_level: string;
  current_status: string;
  notes: string;
  unknowns: string;
  interactions: DemoInteraction[];
  evidence?: { observation: string; interpretation: string; feeling: string; significance: string }[];
};

function dateFrom(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const DEMO: DemoPerson[] = [
  {
    name: "Theo",
    relationship_type: "romantic",
    how_met: "A friend's birthday dinner",
    occupation: "Architect",
    location: "Singapore",
    access_level: "romantic_exploration",
    current_status: "unsure",
    notes: "Very easy to talk to. Intense from the first night. Travels often for work.",
    unknowns: "Conflict style — unknown. How he treats people when he's stressed — unknown.",
    interactions: [
      {
        type: "date",
        daysAgo: 38,
        feelings: ["Excited", "Attracted", "Playful"],
        liked: "The conversation didn't stall once.",
        facts: "Four hours at the bar. He asked about my work twice and remembered the names.",
        metrics: { Attraction: 9, Connection: 7, Fun: 9, "Emotional safety": 6, Effort: 7 },
      },
      {
        type: "date",
        daysAgo: 27,
        feelings: ["Attracted", "Confused"],
        liked: "Chemistry is undeniable.",
        disliked: "He cancelled our first plan this week and only explained when I asked.",
        facts: "Rescheduled twice. Arrived 25 minutes late without messaging.",
        metrics: { Attraction: 9, Connection: 6, Fun: 7, "Emotional safety": 5, Effort: 4 },
        check: { attracted_to: "Both", like_or_potential: "Their potential", chemistry_overlook: "Maybe", getting: ["Attraction", "Excitement"] },
      },
      {
        type: "message",
        daysAgo: 18,
        feelings: ["Anxious", "Curious"],
        disliked: "Three days of silence, then a long voice note like nothing happened.",
        facts: "No contact Mon-Wed. Voice note Thursday evening.",
        metrics: { Attraction: 8, Connection: 5, Fun: 6, "Emotional safety": 4, Effort: 4 },
        check: { future: "Not sure", genuinely_good: "Not sure", getting: ["Attention", "Potential"], imagining: "That the travel is the only reason he goes quiet." },
      },
      {
        type: "date",
        daysAgo: 6,
        feelings: ["Attracted", "Drained"],
        liked: "He is genuinely funny.",
        disliked: "Didn't follow through on the trip he suggested. Again.",
        facts: "Said he'd book the weekend away two weeks ago. Nothing booked.",
        metrics: { Attraction: 9, Connection: 6, Fun: 7, "Emotional safety": 5, Effort: 3 },
        check: { future: "No", genuinely_good: "No", getting: ["Attraction", "Attention"], evidence_compatible: "Honestly, not much yet beyond chemistry." },
      },
    ],
    evidence: [
      {
        observation: "Cancelled plans twice without telling me until I asked.",
        interpretation: "I told myself he was overwhelmed at work.",
        feeling: "Anxious",
        significance: "concerning",
      },
    ],
  },
  {
    name: "Daniel",
    relationship_type: "romantic",
    how_met: "Climbing gym",
    occupation: "Vet",
    location: "Singapore",
    access_level: "getting_to_know",
    current_status: "exploring",
    notes: "Calm. Says what he means. No fireworks at the start, which I noticed.",
    unknowns: "Whether he wants the same kind of freedom I do — unknown.",
    interactions: [
      {
        type: "date",
        daysAgo: 30,
        feelings: ["Calm", "Curious", "Neutral"],
        liked: "He listens properly.",
        facts: "Picked the place because I'd mentioned I like quiet rooms.",
        metrics: { Attraction: 5, Connection: 7, Fun: 6, "Emotional safety": 9, Effort: 8 },
      },
      {
        type: "hangout",
        daysAgo: 20,
        feelings: ["Safe", "Seen", "Calm"],
        liked: "I didn't perform once the whole evening.",
        facts: "He remembered my sister's surgery date and asked about it.",
        metrics: { Attraction: 6, Connection: 8, Fun: 7, "Emotional safety": 9, Effort: 9 },
        check: { attracted_to: "Them", like_or_potential: "Them", certain_liked: "Yes", getting: ["Genuine connection"] },
      },
      {
        type: "date",
        daysAgo: 9,
        feelings: ["Attracted", "Safe", "Playful"],
        liked: "Attraction is actually growing, slowly.",
        facts: "Planned the whole evening and told me the plan in advance.",
        metrics: { Attraction: 7, Connection: 9, Fun: 8, "Emotional safety": 9, Effort: 9 },
      },
    ],
  },
  {
    name: "Marcus",
    relationship_type: "romantic",
    how_met: "App",
    occupation: "Sales",
    location: "Kuala Lumpur",
    access_level: "getting_to_know",
    current_status: "observe",
    notes: "Texts constantly. I enjoy it more than I enjoy him, which is information.",
    unknowns: "What he actually wants — unknown. I've never asked.",
    interactions: [
      {
        type: "message",
        daysAgo: 24,
        feelings: ["Excited", "Attracted"],
        liked: "The attention is relentless and flattering.",
        metrics: { Attraction: 6, Connection: 4, Fun: 6, "Emotional safety": 5, Effort: 8 },
        check: { attracted_to: "Being wanted", like_or_potential: "Not sure", getting: ["Attention", "Validation"] },
      },
      {
        type: "date",
        daysAgo: 15,
        feelings: ["Neutral", "Obligated"],
        disliked: "Talked about himself for most of dinner.",
        facts: "I asked six questions. He asked one.",
        metrics: { Attraction: 5, Connection: 3, Fun: 4, "Emotional safety": 5, Effort: 6 },
        check: { future: "No", genuinely_good: "No", getting: ["Attention", "I don't want to feel alone"] },
      },
      {
        type: "call",
        daysAgo: 4,
        feelings: ["Drained", "Confused"],
        disliked: "I stayed on the phone an hour longer than I wanted to.",
        metrics: { Attraction: 5, Connection: 3, Fun: 4, "Emotional safety": 5, Effort: 7 },
        check: { getting: ["Attention", "Validation"], imagining: "That it would feel different if I just gave it more time." },
      },
    ],
  },
  {
    name: "Priya",
    relationship_type: "friendship",
    how_met: "Old workplace",
    occupation: "Editor",
    location: "Singapore",
    access_level: "inner_circle",
    current_status: "exploring",
    notes: "Eight years. The friendship I measure others against.",
    unknowns: "How she's actually doing since the move — I keep forgetting to ask.",
    interactions: [
      {
        type: "hangout",
        daysAgo: 26,
        feelings: ["Nourished", "Seen", "Playful"],
        liked: "Three hours felt like forty minutes.",
        metrics: { Connection: 9, Nourishment: 9, Fun: 9, "Emotional safety": 10, Mutuality: 9 },
      },
      {
        type: "call",
        daysAgo: 12,
        feelings: ["Nourished", "Energised", "Calm"],
        liked: "She asked the question nobody else thought to ask.",
        metrics: { Connection: 9, Nourishment: 10, Fun: 8, "Emotional safety": 10, Mutuality: 9 },
        check: { enjoy_friendship: "Yes", after_feeling: "Nourished", why_maintain: ["I genuinely enjoy her", "She understands me"] },
      },
      {
        type: "moment",
        daysAgo: 3,
        feelings: ["Seen", "Safe"],
        liked: "She drove over without being asked.",
        facts: "Turned up with food the day my flight got cancelled.",
        metrics: { Connection: 10, Nourishment: 9, Fun: 7, "Emotional safety": 10, Mutuality: 9 },
      },
    ],
  },
];

export async function loadDemoData() {
  for (const person of DEMO) {
    const { data: created, error } = await supabase
      .from("people")
      .insert({
        name: person.name,
        relationship_type: person.relationship_type,
        how_met: person.how_met,
        occupation: person.occupation,
        location: person.location,
        access_level: person.access_level,
        current_status: person.current_status,
        notes: person.notes,
        unknowns: person.unknowns,
        date_met: dateFrom(45),
        is_demo: true,
      })
      .select("id")
      .single();
    if (error || !created) throw new Error(error?.message ?? "Could not create demo person");

    for (const entry of person.interactions) {
      const { data: interaction, error: iErr } = await supabase
        .from("interactions")
        .insert({
          person_id: created.id,
          interaction_type: entry.type,
          date: dateFrom(entry.daysAgo),
          feelings: entry.feelings,
          liked: entry.liked ?? null,
          disliked: entry.disliked ?? null,
          factual_observations: entry.facts ?? null,
          is_demo: true,
        })
        .select("id")
        .single();
      if (iErr || !interaction) throw new Error(iErr?.message ?? "Could not create demo interaction");

      const metricRows = Object.entries(entry.metrics).map(([metric_name, score]) => ({
        interaction_id: interaction.id,
        metric_name,
        score,
      }));
      if (metricRows.length) {
        const { error: mErr } = await supabase.from("interaction_metrics").insert(metricRows);
        if (mErr) throw new Error(mErr.message);
      }

      if (entry.check) {
        const { error: cErr } = await supabase.from("reality_checks").insert({
          person_id: created.id,
          interaction_id: interaction.id,
          answers: entry.check,
          is_demo: true,
        });
        if (cErr) throw new Error(cErr.message);
      }
    }

    for (const ev of person.evidence ?? []) {
      const { error: eErr } = await supabase.from("evidence").insert({
        person_id: created.id,
        observation: ev.observation,
        interpretation: ev.interpretation,
        feeling: ev.feeling,
        significance: ev.significance,
        is_demo: true,
      });
      if (eErr) throw new Error(eErr.message);
    }
  }
}

export async function deleteDemoData() {
  // People cascade to interactions, metrics, checks and evidence.
  const { error } = await supabase.from("people").delete().eq("is_demo", true);
  if (error) throw new Error(error.message);
}
