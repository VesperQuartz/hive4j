import type { Connection } from "@relate/relate";
import { NODE_COUNTS, STALE_ANSWERS } from "./queries";
import type { HiveStats, OverviewResponse, StaleAnswer } from "./types";

const stats = (conn: Connection): HiveStats => {
  const counts = conn.query(NODE_COUNTS).rows.reduce<Record<string, number>>((acc, row) => {
    const label = String((row.labels as string[])[0] ?? "Unknown");
    acc[label] = Number(row.count);
    return acc;
  }, {});

  const statuses = conn.query(
    "MATCH (d:Decision) RETURN d.status AS status, count(*) AS count",
  ).rows;
  const active = statuses.find((row) => row.status === "active");
  const superseded = statuses.find((row) => row.status === "superseded");

  return {
    nodes: Object.values(counts).reduce((sum, count) => sum + count, 0),
    notes: counts.Note ?? 0,
    decisions: counts.Decision ?? 0,
    answers: counts.Answer ?? 0,
    active: Number(active?.count ?? 0),
    superseded: Number(superseded?.count ?? 0),
  };
};

const staleAnswers = (conn: Connection): StaleAnswer[] => {
  const rows = conn.query(STALE_ANSWERS).rows;
  const byAnswer = new Map<string, StaleAnswer>();

  for (const row of rows) {
    const id = String(row.id);
    const current = byAnswer.get(id);
    if (current) {
      current.decisions.push(String(row.decision));
    } else {
      byAnswer.set(id, {
        id,
        question: String(row.question),
        at: String(row.at),
        decisions: [String(row.decision)],
      });
    }
  }

  return [...byAnswer.values()];
};

export const getOverview = (conn: Connection): OverviewResponse => ({
  stats: stats(conn),
  stale: staleAnswers(conn),
});
