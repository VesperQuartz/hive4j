import type { Connection } from "@relate/relate";
import { INSERT_ANSWER, LINK_ANCHOR, LINK_ANSWER } from "./queries";
import type { AnswerSegment, HiveAnswer, HiveBundle, HiveNode } from "./types";

const snippet = (text: string, limit = 240): string => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit);
  const boundary = cut.lastIndexOf(" ");
  return `${cut.slice(0, boundary > 80 ? boundary : limit)}…`;
};

const composeSegments = (bundle: HiveBundle): AnswerSegment[] => {
  const byId = new Map<string, HiveNode>(bundle.nodes.map((node) => [node.id, node]));
  const decisions = bundle.nodes.filter((node) => node.label === "Decision");
  const active =
    (bundle.anchorId ? byId.get(bundle.anchorId) : undefined) ??
    decisions.find((node) => node.status === "active") ??
    decisions[0];
  const segments: AnswerSegment[] = [];

  if (!active) {
    const notes = bundle.nodes.filter((node) => node.label === "Note");
    if (notes.length === 0) {
      return [
        {
          text: `The graph has no notes matching “${bundle.question}”. Try one of the suggested questions, or rephrase it around a decision, a project, or a person.`,
          cites: [],
        },
      ];
    }
    segments.push({
      text: `I found ${notes.length} related note${notes.length === 1 ? "" : "s"}, but no decision is recorded in this part of the graph.`,
      cites: notes.slice(0, 3).map((note) => note.id),
    });
    const first = notes[0];
    segments.push({
      text: `Closest note: “${first.title}” (${first.date}). ${snippet(first.text)}`,
      cites: [first.id],
    });
    return segments;
  }

  const personEdge = bundle.edges.find(
    (edge) => edge.from === active.id && edge.rel === "DECIDED_BY",
  );
  const person = personEdge ? byId.get(personEdge.to) : undefined;
  const oldEdge = bundle.edges.find((edge) => edge.from === active.id && edge.rel === "SUPERSEDES");
  const older = oldEdge ? byId.get(oldEdge.to) : undefined;
  const noteEdge =
    bundle.edges.find((edge) => edge.to === active.id && edge.rel === "STATES") ??
    bundle.edges.find((edge) => edge.to === active.id && edge.rel === "CONTEXT_FOR");
  const note = noteEdge ? byId.get(noteEdge.from) : undefined;

  const headline = person
    ? `The active decision is “${active.text}” (${active.date}), made by ${person.title}.`
    : `The active decision is “${active.text}” (${active.date}).`;
  segments.push({
    text: headline,
    cites: person ? [active.id, person.id] : [active.id],
  });

  if (active.reason) {
    segments.push({ text: `Why: ${active.reason}`, cites: [active.id] });
  }

  if (older) {
    segments.push({
      text: `It replaced “${older.text}” from ${older.date}. That decision is still in the graph, marked superseded rather than deleted.`,
      cites: [older.id],
    });
  }

  if (note) {
    segments.push({
      text: `Recorded in “${note.title}” (${note.date}): ${snippet(note.text)}`,
      cites: [note.id],
    });
  } else {
    segments.push({
      text: `The decision is in the graph, but the note that recorded it is outside the selected context.`,
      cites: [active.id],
    });
  }

  return segments;
};

export const composeAnswer = (bundle: HiveBundle): HiveAnswer => {
  const id = `ans-${crypto.randomUUID().slice(0, 8)}`;
  return {
    id,
    question: bundle.question,
    segments: composeSegments(bundle),
    mode: "evidence",
  };
};

export const saveAnswer = (
  conn: Connection,
  answer: HiveAnswer,
  usedIds: string[],
  anchorId: string | null,
): void => {
  conn.begin();
  try {
    conn.query(INSERT_ANSWER, {
      id: answer.id,
      question: answer.question,
      text: answer.segments.map((segment) => segment.text).join(" "),
      at: new Date().toISOString(),
      mode: answer.mode,
    });
    conn.query(LINK_ANSWER, { id: answer.id, usedIds });
    if (anchorId) conn.query(LINK_ANCHOR, { id: answer.id, decisionId: anchorId });
    conn.commit();
  } catch (error) {
    conn.rollback();
    throw error;
  }
};
