export type RelationshipType = "romantic" | "friendship";

export const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] = [
  { value: "romantic", label: "Romantic" },
  { value: "friendship", label: "Friendship" },
];

export const ACCESS_LEVELS = [
  { value: "acquaintance", label: "Acquaintance", note: "I know you." },
  { value: "getting_to_know", label: "Getting to know", note: "I'm curious about you." },
  { value: "inner_circle", label: "Inner circle", note: "You have meaningful access to my life." },
  {
    value: "romantic_exploration",
    label: "Romantic exploration",
    note: "I'm intentionally exploring whether there is something here.",
  },
  { value: "committed", label: "Committed", note: "This person has significant access to my life." },
] as const;

export const STATUSES = [
  { value: "exploring", label: "Keep exploring" },
  { value: "slow_down", label: "Slow down" },
  { value: "observe", label: "Observe" },
  { value: "conversation", label: "Have a conversation" },
  { value: "distance", label: "Create more distance" },
  { value: "ended", label: "End it" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const INTERACTION_TYPES = [
  { value: "date", label: "Date" },
  { value: "hangout", label: "Hangout" },
  { value: "call", label: "Call" },
  { value: "message", label: "Message" },
  { value: "conflict", label: "Conflict" },
  { value: "moment", label: "Meaningful moment" },
  { value: "other", label: "Other" },
] as const;

export const FEELINGS = [
  "Calm",
  "Excited",
  "Curious",
  "Playful",
  "Attracted",
  "Seen",
  "Safe",
  "Nourished",
  "Energised",
  "Anxious",
  "Confused",
  "Drained",
  "Small",
  "Judged",
  "Obligated",
  "Relieved",
  "Neutral",
];

export const HEAVY_FEELINGS = ["Anxious", "Confused", "Drained", "Small", "Judged", "Obligated"];
export const NOURISHING_FEELINGS = ["Calm", "Seen", "Safe", "Nourished", "Energised", "Playful"];

export const QUICK_METRICS: Record<RelationshipType, string[]> = {
  romantic: ["Attraction", "Connection", "Fun", "Emotional safety", "Effort"],
  friendship: ["Connection", "Nourishment", "Fun", "Emotional safety", "Mutuality"],
};

export const PROFILE_SIGNALS: Record<RelationshipType, string[]> = {
  romantic: [
    "Attraction",
    "Chemistry",
    "Connection",
    "Emotional safety",
    "Fun",
    "Effort",
    "Generosity",
    "Curiosity",
    "Thoughtfulness",
    "Follow-through",
    "Independence",
    "Adventure",
    "Feeling understood",
  ],
  friendship: [
    "Connection",
    "Nourishment",
    "Trust",
    "Fun",
    "Feeling understood",
    "Generosity",
    "Curiosity",
    "Reliability",
    "Emotional safety",
    "Shared values",
    "Mutuality",
  ],
};

export const SIGNIFICANCE = [
  { value: "small", label: "Small" },
  { value: "watching", label: "Worth watching" },
  { value: "concerning", label: "Concerning" },
  { value: "dealbreaker", label: "Dealbreaker" },
] as const;

export const NEXT_STEPS = [
  "Observe",
  "Ask",
  "Communicate",
  "Set a boundary",
  "Give it time",
  "Step back",
  "End it",
  "Nothing yet",
];

export const CONTINUING_REASONS = [
  "Attention",
  "Validation",
  "Attraction",
  "Company",
  "Physical intimacy",
  "Excitement",
  "Hope",
  "Potential",
  "I don't want to feel alone",
  "Genuine connection",
  "Other",
];

export const FRIENDSHIP_REASONS = [
  "I genuinely enjoy her",
  "Shared values",
  "She understands me",
  "We make each other better",
  "We have fun",
  "I admire her",
  "We have history",
  "I feel responsible for her",
  "I'm afraid of losing the friendship",
  "I like being liked",
  "I'm lonely",
  "Guilt",
  "Habit",
  "I don't know",
];

export const CRITERIA_TYPES = [
  { value: "core", label: "Core" },
  { value: "preference", label: "Preference" },
  { value: "watch", label: "Watch" },
  { value: "dealbreaker", label: "Dealbreaker" },
] as const;

export const DEFAULT_CRITERIA: { name: string; type: string }[] = [
  { name: "Nourishing connection", type: "core" },
  { name: "Generosity", type: "core" },
  { name: "Curiosity", type: "core" },
  { name: "Capacity to understand me", type: "core" },
  { name: "Emotional safety", type: "core" },
  { name: "Adventure", type: "core" },
  { name: "Respects my independence", type: "core" },
  { name: "Is not threatened by my need for freedom", type: "core" },
  { name: "Does not try to control me", type: "core" },
  { name: "Thoughtfulness", type: "core" },
  { name: "Follow-through", type: "core" },
  { name: "Funny / good sense of humour", type: "preference" },
  { name: "Patient", type: "preference" },
  { name: "Makes plans", type: "preference" },
  { name: "Can figure things out together", type: "preference" },
  { name: "Has his own life", type: "preference" },
  { name: "Deeply devoted", type: "preference" },
  { name: "Makes me feel adored", type: "preference" },
];

export function labelFor(
  list: readonly { value: string; label: string }[],
  value: string | null | undefined,
) {
  return list.find((item) => item.value === value)?.label ?? value ?? "—";
}

export const VOICE_LINES = [
  "Evidence over potential.",
  "Chemistry is information, not instruction.",
  "You don't need to decide yet.",
  "Not everything intense is meaningful.",
  "What actually happened?",
];
