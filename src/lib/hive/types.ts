export type HiveLabel = "Note" | "Decision" | "Person" | "Project";

export type HiveNode = {
  id: string;
  label: HiveLabel;
  title: string;
  text: string;
  date: string;
  status: string;
  reason: string;
  hops: number;
  score: number;
};

export type HiveEdge = {
  from: string;
  to: string;
  rel: string;
};

export type HiveSeed = {
  id: string;
  title: string;
  score: number;
};

export type HiveBundle = {
  question: string;
  search: string;
  seeds: HiveSeed[];
  nodes: HiveNode[];
  edges: HiveEdge[];
  anchorId: string | null;
  tokens: number;
  budget: number;
  usedIds: string[];
};

export type AnswerSegment = {
  text: string;
  cites: string[];
};

export type HiveAnswer = {
  id: string;
  question: string;
  segments: AnswerSegment[];
  mode: "evidence";
};

export type AskResponse = {
  answer: HiveAnswer;
  bundle: HiveBundle;
};

export type HiveStats = {
  nodes: number;
  notes: number;
  decisions: number;
  answers: number;
  active: number;
  superseded: number;
};

export type StaleAnswer = {
  id: string;
  question: string;
  at: string;
  decisions: string[];
};

export type OverviewResponse = {
  stats: HiveStats;
  stale: StaleAnswer[];
};

export type PersonRef = {
  id: string;
  name: string;
};

export type ProjectRef = {
  id: string;
  name: string;
};

export type LibraryNote = {
  id: string;
  title: string;
  body: string;
  date: string;
  author: PersonRef | null;
  projects: ProjectRef[];
  decisions: { id: string; text: string; status: string }[];
};

export type LibraryDecision = {
  id: string;
  text: string;
  reason: string;
  date: string;
  status: string;
  person: PersonRef | null;
  projects: ProjectRef[];
  note: { id: string; title: string } | null;
  supersededBy: { id: string; text: string } | null;
};

export type Library = {
  notes: LibraryNote[];
  decisions: LibraryDecision[];
  people: PersonRef[];
  projects: ProjectRef[];
};

export type CreateNoteInput = {
  title: string;
  body: string;
  authorId: string;
  projectIds: string[];
  decision?: {
    text: string;
    reason: string;
  };
};

export type CreateNoteResponse = {
  noteId: string;
  decisionId: string | null;
};

export type CreateDecisionInput = {
  text: string;
  reason: string;
  personId: string;
  projectId: string;
  noteId?: string;
};

export type CreateDecisionResponse = {
  decisionId: string;
  noteId: string;
};

export type CreateEntityInput = {
  kind: "person" | "project";
  name: string;
};

export type CreateEntityResponse = {
  id: string;
  name: string;
  kind: "person" | "project";
};

export type CorrectResponse = {
  decisionId: string;
  supersededId: string;
};

export const SUGGESTED_QUESTIONS = [
  "Why did we move off Auth0?",
  "Why did we switch the database to Neon?",
  "What did we decide about pricing?",
  "Why did we leave Vercel?",
  "What changed about analytics?",
] as const;
