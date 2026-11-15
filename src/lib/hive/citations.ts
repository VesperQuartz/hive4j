import type { HiveAnswer, HiveBundle, HiveNode } from "./types";

export const citationOrder = (bundle: HiveBundle): HiveNode[] => {
  const decisions = bundle.nodes
    .filter((node) => node.label === "Decision")
    .sort((a, b) => Number(b.status === "active") - Number(a.status === "active"));
  const notes = bundle.nodes.filter((node) => node.label === "Note");
  const entities = bundle.nodes.filter(
    (node) => node.label === "Person" || node.label === "Project",
  );

  return [...decisions, ...notes, ...entities];
};

export const buildCitationIndex = (bundle: HiveBundle, answer: HiveAnswer): Map<string, number> => {
  const cited = new Set(answer.segments.flatMap((segment) => segment.cites));
  const index = new Map<string, number>();

  for (const node of citationOrder(bundle)) {
    if (cited.has(node.id) && !index.has(node.id)) {
      index.set(node.id, index.size + 1);
    }
  }

  return index;
};
