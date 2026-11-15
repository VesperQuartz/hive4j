import type { Connection } from "@relate/relate";
import { NEIGHBORS, SEARCH_NOTES } from "./queries";
import { searchTerms, toSearchQuery } from "./text";
import type { HiveBundle, HiveEdge, HiveLabel, HiveNode, HiveSeed } from "./types";

const BUDGET = 1400;
const MAX_NODES = 18;
const MAX_SEEDS = 5;

type SearchRow = {
  id: string;
  title: string;
  body: string;
  date: string;
  score: number;
};

type NeighborRow = {
  from: string;
  id: string;
  labels: string[];
  rel: string;
  startId: string;
  endId: string;
  title: string;
  name: string;
  text: string;
  body: string;
  date: string;
  status: string;
  reason: string;
};

const HiveLabels = new Set<HiveLabel>(["Note", "Decision", "Person", "Project"]);

const labelOf = (labels: string[]): HiveLabel | null => {
  const label = labels.find((value) => HiveLabels.has(value as HiveLabel));
  return (label as HiveLabel | undefined) ?? null;
};

const search = (conn: Connection, query: string, k: number): SearchRow[] => {
  const rows = conn.query(SEARCH_NOTES, { q: query, k }).rows as SearchRow[];
  return rows.map((row) => ({ ...row, score: Number(row.score) }));
};

const findSeeds = (conn: Connection, question: string): SearchRow[] => {
  const terms = searchTerms(question);
  const primary = search(conn, terms.join(" "), MAX_SEEDS);
  if (primary.length >= 3) return primary;

  const merged = new Map<string, SearchRow & { matches: number }>();
  for (const term of terms.slice(0, 6)) {
    for (const row of search(conn, term, 6)) {
      const current = merged.get(row.id);
      if (current) {
        current.score += row.score;
        current.matches += 1;
      } else {
        merged.set(row.id, { ...row, matches: 1 });
      }
    }
  }

  return [...merged.values()]
    .map((row) => ({ ...row, score: row.score + (row.matches - 1) * 0.5 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SEEDS);
};

const neighbors = (conn: Connection, ids: string[]): NeighborRow[] => {
  if (ids.length === 0) return [];
  return conn.query(NEIGHBORS, { ids, limit: 240 }).rows as NeighborRow[];
};

export const assembleContext = (conn: Connection, question: string): HiveBundle => {
  const seedRows = findSeeds(conn, question);
  const topScore = seedRows[0]?.score ?? 1;
  const nodes = new Map<string, HiveNode>();
  const edges = new Map<string, HiveEdge>();
  const seeds: HiveSeed[] = [];

  for (const row of seedRows) {
    seeds.push({ id: row.id, title: row.title, score: Number((row.score / topScore).toFixed(3)) });
    nodes.set(row.id, {
      id: row.id,
      label: "Note",
      title: row.title,
      text: row.body,
      date: row.date,
      status: "",
      reason: "",
      hops: 0,
      score: 1 + (row.score / topScore) * 0.5,
    });
  }

  const addEdge = (edge: { startId: string; endId: string; rel: string }) => {
    const key = `${edge.startId}|${edge.rel}|${edge.endId}`;
    if (!edges.has(key)) edges.set(key, { from: edge.startId, to: edge.endId, rel: edge.rel });
  };

  let frontier = seeds.map((seed) => seed.id);
  for (let hop = 1; hop <= 2; hop += 1) {
    const rows = neighbors(conn, frontier);
    const next: string[] = [];

    for (const row of rows) {
      const label = labelOf(row.labels ?? []);
      if (!label) continue;

      addEdge(row);

      if (!nodes.has(row.id)) {
        const bonus = label === "Decision" ? 0.35 : label === "Note" ? 0.05 : 0;
        nodes.set(row.id, {
          id: row.id,
          label,
          title: row.title || row.name || row.text.slice(0, 64),
          text: label === "Note" ? row.body : label === "Decision" ? row.text : row.name,
          date: row.date ?? "",
          status: row.status ?? "",
          reason: row.reason ?? "",
          hops: hop,
          score: 1 - hop * 0.45 + bonus,
        });
        next.push(row.id);
      }
    }

    frontier = next;
    if (frontier.length === 0) break;
  }

  const byScore = [...nodes.values()].sort((a, b) => b.score - a.score);
  const edgeList = [...edges.values()];
  const seedIds = seeds.map((seed) => seed.id);
  const seedSet = new Set(seedIds);
  const selected = new Set<string>(seedIds);

  const statesEdge = (seedId: string) =>
    edgeList.find(
      (edge) =>
        edge.from === seedId && edge.rel === "STATES" && nodes.get(edge.to)?.label === "Decision",
    );
  const successor = (decisionId: string) =>
    edgeList.find((edge) => edge.rel === "SUPERSEDES" && edge.to === decisionId)?.from;
  const latestDecision = (decisionId: string): string => {
    const seen = new Set<string>();
    let current = decisionId;
    for (;;) {
      if (seen.has(current)) return current;
      seen.add(current);
      const next = successor(current);
      if (!next) return current;
      current = next;
    }
  };

  const anchorEdge = seeds.map((seed) => statesEdge(seed.id)).find((edge) => Boolean(edge));
  const anchorDecisionId = anchorEdge ? latestDecision(anchorEdge.to) : undefined;
  const anchorNoteId = anchorEdge?.from;

  const directDecisions = edgeList
    .filter((edge) => seedSet.has(edge.from) && edge.rel === "STATES")
    .map((edge) => nodes.get(edge.to))
    .filter((node): node is HiveNode => node?.label === "Decision")
    .sort(
      (a, b) => Number(b.status === "active") - Number(a.status === "active") || b.score - a.score,
    );

  for (const decision of directDecisions.slice(0, 4)) selected.add(decision.id);
  if (anchorDecisionId) selected.add(anchorDecisionId);

  const otherDecisions = byScore
    .filter((node) => node.label === "Decision" && !selected.has(node.id))
    .slice(0, 2);
  for (const decision of otherDecisions) selected.add(decision.id);

  const supersededIds = edgeList
    .filter((edge) => edge.rel === "SUPERSEDES" && selected.has(edge.from))
    .map((edge) => edge.to);
  for (const id of supersededIds) selected.add(id);

  const adjacent = (decisionId: string | undefined, rel: string) =>
    decisionId
      ? edgeList.find((edge) => edge.from === decisionId && edge.rel === rel)?.to
      : undefined;
  const anchorPerson = adjacent(anchorDecisionId, "DECIDED_BY");
  const anchorProject = adjacent(anchorDecisionId, "ABOUT");
  if (anchorPerson) selected.add(anchorPerson);
  if (anchorProject) selected.add(anchorProject);

  for (const node of byScore) {
    if (node.label !== "Person" && node.label !== "Project") continue;
    if (selected.has(node.id)) continue;
    const near = edgeList.some(
      (edge) =>
        (edge.from === node.id && selected.has(edge.to)) ||
        (edge.to === node.id && selected.has(edge.from)),
    );
    if (near && selected.size < MAX_NODES) selected.add(node.id);
  }

  const essential = new Set<string>(
    [anchorNoteId, anchorDecisionId, anchorPerson, anchorProject, ...supersededIds].filter(
      (id): id is string => Boolean(id),
    ),
  );
  const optional = [...selected]
    .filter((id) => !essential.has(id))
    .sort((a, b) => (nodes.get(a)?.score ?? 0) - (nodes.get(b)?.score ?? 0));

  const estimate = (ids: Set<string>): number =>
    [...ids].reduce((sum, id) => {
      const node = nodes.get(id);
      if (!node) return sum;
      return sum + Math.ceil(`${node.title} ${node.text} ${node.reason}`.trim().length / 4);
    }, 0);

  while (estimate(selected) > BUDGET && optional.length > 0) {
    const drop = optional.shift();
    if (drop) selected.delete(drop);
  }

  const kept = new Map<string, HiveNode>();
  for (const node of byScore) {
    if (selected.has(node.id) && kept.size < MAX_NODES) kept.set(node.id, node);
  }

  const keptEdges = [...edges.values()].filter((edge) => kept.has(edge.from) && kept.has(edge.to));
  const tokens = estimate(new Set(kept.keys()));

  return {
    question,
    search: toSearchQuery(question),
    seeds,
    nodes: [...kept.values()].sort((a, b) => b.score - a.score),
    edges: keptEdges,
    anchorId: anchorDecisionId ?? null,
    tokens,
    budget: BUDGET,
    usedIds: [...kept.keys()],
  };
};
