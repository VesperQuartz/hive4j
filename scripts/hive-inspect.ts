import { resolve } from "node:path";
import { Database } from "@relate/relate";

const store = resolve(process.argv[2] ?? "data/seed/hive.rl");
const db = Database.open(store, { readOnly: true });
const conn = db.connect();

const counts = conn.query("MATCH (n) RETURN labels(n) AS labels, count(*) AS count").rows;
const rels = conn.query("MATCH ()-[r]->() RETURN type(r) AS type, count(*) AS count").rows;
const decisions = conn.query(
  "MATCH (d:Decision) RETURN d.id AS id, d.status AS status, d.text AS text ORDER BY d.date",
).rows;
const answers = conn.query(
  "MATCH (a:Answer)-[:ANSWERED_WITH]->(d:Decision) RETURN a.question AS question, d.text AS decision",
).rows;

console.log(`Store: ${store}`);
console.log(
  "Nodes:",
  Object.fromEntries(counts.map((row) => [(row.labels as string[])[0], Number(row.count)])),
);
console.log(
  "Relationships:",
  Object.fromEntries(rels.map((row) => [String(row.type), Number(row.count)])),
);

console.log("\nDecisions:");
for (const decision of decisions) {
  console.log(
    `  [${String(decision.status).padEnd(10)}] ${String(decision.id).padEnd(18)} ${String(decision.text)}`,
  );
}

console.log("\nAnswers and the decisions they used:");
for (const answer of answers) {
  console.log(`  ${String(answer.question)} -> ${String(answer.decision)}`);
}
