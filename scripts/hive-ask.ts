import { askHive } from "../src/lib/hive/ask";
import { hiveHandle } from "../src/lib/hive/db";

const question = process.argv.slice(2).join(" ").trim();
if (!question) {
  console.error('Ask a question, for example: bun run hive:ask "Why did we move off Auth0?"');
  process.exit(1);
}

const result = askHive(question);
hiveHandle().database.checkpoint();

console.log(`\nQ: ${result.answer.question}\n`);
for (const segment of result.answer.segments) {
  console.log(`${segment.text}  [${segment.cites.join(", ")}]\n`);
}
console.log(
  `Context: ${result.bundle.nodes.length} nodes, ${result.bundle.edges.length} edges, ~${result.bundle.tokens} tokens of ${result.bundle.budget}`,
);
console.log("Seeds:", result.bundle.seeds.map((seed) => seed.title).join(" | "));
