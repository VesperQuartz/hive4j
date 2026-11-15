# Devpost submission draft

## Title

Hive — answers with receipts

## Tagline

Ask your team's notes why. Every answer ships with the graph it used, and every correction leaves a trail.

## What it does

Hive is a workspace over a team's notes and decisions. It has four surfaces:

- **Ask** — a question, an answer, and the receipt behind it.
- **Notes** — add a note with an author and projects, and optionally record a decision in the same step.
- **Decisions** — add a decision with a source note, or correct an active one.
- **Review** — answers that asserted a decision which has since been superseded.

You ask "Why did we move off Auth0?" and Hive finds the notes that match, follows two hops to the decision, the person who made it, the project it affects, and the decision it replaced. The answer is composed from those paths, and a receipt shows every node and edge it used.

The part a vector store cannot do: every answer is stored with `USED` edges to its context and an `ANSWERED_WITH` edge to the decision it asserted. When you correct that decision, the old node stays in the graph, marked superseded, and every answer that asserted it moves to **Answers that need review**. The question "which answers relied on the decision I just changed?" is a reverse traversal, not a search.

The seed gives you a team to explore, but the app is writable. A note added in the app is immediately answerable: Relate updates the full-text index, and the next question can seed from it.

## The problem

Teams keep decisions in notes. Six months later nobody remembers why. Assistants retrieve five chunks, assert an answer, and when they are wrong nobody can see which evidence produced it. When a fact changes, the old version silently lingers and keeps poisoning answers.

Hive treats context as a graph and provenance as edges. That makes the answer auditable and the correction visible.

## How it uses Relate

- **Embedded Node.js client** (`@relate/relate`) — the engine runs inside the app, no server.
- **Single-file store** — `data/seed/hive.rl` is committed; the app copies it to `data/run/hive.rl` on first boot.
- **Full-text index** — `CREATE FULLTEXT INDEX note_text ...` with `SEARCH ... SCORE AS` (BM25) seeds the context.
- **Cypher traversal** — two-hop expansion over `STATES`, `DECIDED_BY`, `ABOUT`, and `SUPERSEDES`.
- **Explicit transactions** — answers and corrections are written as one unit.
- **`relate` CLI** — the committed store can be inspected without the app.

No vectors, no model, no server. The graph is the product.

## What connects to what

```cypher
(:Note)-[:AUTHORED_BY]->(:Person)
(:Note)-[:MENTIONS]->(:Project)
(:Note)-[:STATES]->(:Decision)
(:Note)-[:CONTEXT_FOR]->(:Decision)
(:Decision)-[:DECIDED_BY]->(:Person)
(:Decision)-[:ABOUT]->(:Project)
(:Decision)-[:SUPERSEDES]->(:Decision)
(:Answer)-[:USED]->(:Note|:Decision|:Person|:Project)
(:Answer)-[:ANSWERED_WITH]->(:Decision)
```

The seed graph is a fictional company, Rill: 18 notes, 18 decisions (6 superseded), 6 people, and 4 projects over eight months. It is synthetic and committed so the demo is reproducible.

## The three questions only a graph can answer

1. **Why did we move off Auth0?** — the reason is on a `Decision`, connected to the meeting and the person, and the old decision is one `SUPERSEDES` hop away.
2. **What did we decide about pricing?** — the current answer is the newest node in a supersession chain, not the note that mentions "pricing" most often.
3. **Which answers relied on the decision I just corrected?** — `Answer -[:ANSWERED_WITH]-> Decision`. There is no chunk to search.

## How it was built

- TypeScript, Bun, TanStack Start, React, Tailwind CSS.
- Relate 1.0.1 via `@relate/relate`.
- Evidence mode composes the answer from graph paths. No LLM, no API key, no model download.
- The answer is deterministic: the same question against the same store produces the same paths.
- Writes go through a small library layer (`src/lib/hive/library.ts`): validate, then one transaction for the note, decision, and edges. People and projects can be added without leaving the app.

### AI use

The app was built with an AI coding agent (OpenCode) under the author's direction. The seed corpus is synthetic and was drafted with AI assistance, then reviewed for consistency with the graph. No third-party code was copied beyond the open-source packages listed in `package.json`.

The repository extends a private TanStack Start starter (auth, Drizzle, oRPC scaffolding) that predates the contest. The Hive feature — corpus, schema, context assembly, evidence answer, receipt UI, correction flow — was written during the contest period. The starter's todo demo is replaced by a redirect to `/hive`.

## Challenges

- **One writer per store.** Relate allows one writing process. The app uses a singleton across HMR, a read-only committed seed, and a gitignored run copy. The README documents how to inspect the live store.
- **Full-text analysis.** The English analyzer stems the query while the index keeps written forms, so "analytics" and "decision" returned nothing. The fix was plain term search plus per-term merging when the combined query is too strict.
- **Native module in Vite.** `@relate/relate` uses `koffi`; the dev optimizer and production build tried to load every platform binary. `optimizeDeps.exclude`, `ssr.external`, and `build.rollupOptions.external` keep it on the server.
- **Making context legible.** A list of nodes is not a receipt. The UI shows the token budget, the nodes grouped by type, the paths in a small graph, and the decision behind each citation.

## What's next

- Vector seeding for fuzzy recall, keeping the graph traversal as the second stage.
- `relate serve --mcp` so another agent can query the same store.
- A bulk importer for real meeting notes (Slack, email, markdown folders).
- A "review queue" that marks answers stale automatically when a decision changes.

## Links

- Repository: https://github.com/VesperQuartz/hive4j
- Live demo: https://hive4j.fly.dev
- Demo video: _add 1–2 minute URL_
- Try it: `bun install && bun run hive:seed && bun dev`, then open `/hive`.

## Submission checklist

- [x] README with setup, mode, graph model, and data location
- [x] Public GitHub repository
- [x] GitHub topic `relate` (and recommended `relate-neo4j-hackathon`)
- [x] Persistent Relate store committed (`data/seed/hive.rl`)
- [x] Working code with Relate running
- [x] 1–2 minute demo script (`docs/demo-script.md`)
- [x] Project description: use case and what connects to what
- [ ] Demo video recorded
- [ ] Submitted on Devpost
