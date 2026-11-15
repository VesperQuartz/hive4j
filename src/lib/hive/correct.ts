import type { Connection } from "@relate/relate";
import type { CorrectResponse } from "./types";

export const correctDecision = (
  conn: Connection,
  input: { decisionId: string; text: string; reason: string },
): CorrectResponse => {
  const text = input.text.trim();
  const reason = input.reason.trim();
  if (text.length < 8) throw new Error("The corrected decision needs at least 8 characters.");
  if (reason.length < 4) throw new Error("Add a reason so the correction explains itself.");

  const existing = conn.query(
    "MATCH (d:Decision {id: $id}) RETURN d.id AS id, d.status AS status",
    { id: input.decisionId },
  ).rows[0];

  if (!existing) throw new Error("That decision is not in the graph.");
  if (existing.status === "superseded") throw new Error("That decision is already superseded.");

  const now = new Date();
  const decisionId = `dec-${crypto.randomUUID().slice(0, 8)}`;

  conn.begin();
  try {
    conn.query("MATCH (d:Decision {id: $id}) SET d.status = 'superseded', d.validTo = $at", {
      id: input.decisionId,
      at: now.toISOString(),
    });
    conn.query(
      `CREATE (:Decision {
        id: $id, text: $text, reason: $reason, date: $date,
        status: 'active', validFrom: $at, validTo: null
      })`,
      { id: decisionId, text, reason, date: now.toISOString().slice(0, 10), at: now.toISOString() },
    );
    conn.query(
      "MATCH (n:Decision {id: $new}), (old:Decision {id: $old}) CREATE (n)-[:SUPERSEDES]->(old)",
      { new: decisionId, old: input.decisionId },
    );
    conn.query(
      "MATCH (n:Decision {id: $new}), (old:Decision {id: $old})-[:ABOUT]->(p:Project) CREATE (n)-[:ABOUT]->(p)",
      { new: decisionId, old: input.decisionId },
    );
    conn.query(
      "MATCH (n:Decision {id: $new}), (old:Decision {id: $old})-[:DECIDED_BY]->(p:Person) CREATE (n)-[:DECIDED_BY]->(p)",
      { new: decisionId, old: input.decisionId },
    );
    conn.query(
      "MATCH (n:Decision {id: $new}), (note:Note)-[:STATES]->(old:Decision {id: $old}) CREATE (note)-[:STATES]->(n)",
      { new: decisionId, old: input.decisionId },
    );
    conn.commit();
  } catch (error) {
    conn.rollback();
    throw error;
  }

  return { decisionId, supersededId: input.decisionId };
};
