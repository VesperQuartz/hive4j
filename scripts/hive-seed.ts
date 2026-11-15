import { readdir, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Database } from "@relate/relate";
import { parse } from "yaml";

type SeedDecision = {
  id: string;
  text: string;
  reason?: string;
  supersedes?: string;
};

type SeedNote = {
  id: string;
  title: string;
  date: string;
  author: string;
  projects: string[];
  decisions?: SeedDecision[];
  body: string;
  path: string;
};

const ROOT = resolve(import.meta.dir, "..");
const NOTES_DIR = join(ROOT, "data/seed/notes");
const STORE = join(ROOT, "data/seed/hive.rl");
const RUN_STORE = join(ROOT, "data/run/hive.rl");

const PEOPLE: Record<string, string> = {
  priya: "Priya Raghavan",
  marco: "Marco Silva",
  lena: "Lena Fischer",
  sam: "Sam Okafor",
  aisha: "Aisha Bello",
  tom: "Tom Whitaker",
};

const PROJECTS: Record<string, string> = {
  rill: "Rill",
  atlas: "Atlas",
  beacon: "Beacon",
  console: "Console",
};

const parseNote = (raw: string, path: string): SeedNote => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!match) throw new Error(`${path} is missing frontmatter`);

  const meta = parse(match[1]) as Omit<SeedNote, "body" | "path"> | null;
  if (!meta?.id || !meta.title || !meta.date || !meta.author) {
    throw new Error(`${path} frontmatter needs id, title, date, and author`);
  }

  return {
    ...meta,
    projects: meta.projects ?? [],
    decisions: meta.decisions ?? [],
    body: match[2].trim(),
    path,
  };
};

const run = async () => {
  const files = (await readdir(NOTES_DIR)).filter((file) => file.endsWith(".md")).sort();
  const notes = await Promise.all(
    files.map(async (file) => parseNote(await readFile(join(NOTES_DIR, file), "utf8"), file)),
  );

  const supersededBy = new Map<string, { id: string; date: string }>();
  for (const note of notes) {
    for (const decision of note.decisions ?? []) {
      if (decision.supersedes)
        supersededBy.set(decision.supersedes, { id: decision.id, date: note.date });
    }
  }

  await rm(STORE, { force: true });
  await rm(RUN_STORE, { force: true });

  const db = Database.open(STORE);
  const conn = db.connect();

  conn.begin();
  try {
    for (const [id, name] of Object.entries(PEOPLE)) {
      conn.query("CREATE (:Person {id: $id, name: $name})", { id, name });
    }
    for (const [id, name] of Object.entries(PROJECTS)) {
      conn.query("CREATE (:Project {id: $id, name: $name})", { id, name });
    }

    for (const note of notes) {
      conn.query("CREATE (:Note {id: $id, title: $title, body: $body, date: $date, path: $path})", {
        id: note.id,
        title: note.title,
        body: note.body,
        date: note.date,
        path: note.path,
      });
      conn.query(
        "MATCH (n:Note {id: $note}), (p:Person {id: $person}) CREATE (n)-[:AUTHORED_BY]->(p)",
        {
          note: note.id,
          person: note.author,
        },
      );
      for (const project of note.projects) {
        conn.query(
          "MATCH (n:Note {id: $note}), (p:Project {id: $project}) CREATE (n)-[:MENTIONS]->(p)",
          {
            note: note.id,
            project,
          },
        );
      }

      for (const decision of note.decisions ?? []) {
        const replaced = supersededBy.get(decision.id);
        conn.query(
          `CREATE (:Decision {
            id: $id, text: $text, reason: $reason, date: $date,
            status: $status, validFrom: $date, validTo: $validTo
          })`,
          {
            id: decision.id,
            text: decision.text,
            reason: decision.reason ?? "",
            date: note.date,
            status: replaced ? "superseded" : "active",
            validTo: replaced?.date ?? null,
          },
        );
        conn.query(
          "MATCH (n:Note {id: $note}), (d:Decision {id: $decision}) CREATE (n)-[:STATES]->(d)",
          {
            note: note.id,
            decision: decision.id,
          },
        );
        conn.query(
          "MATCH (d:Decision {id: $decision}), (p:Person {id: $person}) CREATE (d)-[:DECIDED_BY]->(p)",
          {
            decision: decision.id,
            person: note.author,
          },
        );
        for (const project of note.projects) {
          conn.query(
            "MATCH (d:Decision {id: $decision}), (p:Project {id: $project}) CREATE (d)-[:ABOUT]->(p)",
            {
              decision: decision.id,
              project,
            },
          );
        }
        if (decision.supersedes) {
          conn.query(
            "MATCH (new:Decision {id: $new}), (old:Decision {id: $old}) CREATE (new)-[:SUPERSEDES]->(old)",
            { new: decision.id, old: decision.supersedes },
          );
          conn.query(
            "MATCH (note:Note)-[:STATES]->(old:Decision {id: $old}), (new:Decision {id: $new}) CREATE (note)-[:CONTEXT_FOR]->(new)",
            { new: decision.id, old: decision.supersedes },
          );
        }
      }
    }

    conn.query(
      "CREATE FULLTEXT INDEX note_text IF NOT EXISTS FOR (n:Note) ON EACH [n.title, n.body]",
    );
    conn.query(
      "CREATE FULLTEXT INDEX decision_text IF NOT EXISTS FOR (d:Decision) ON EACH [d.text, d.reason]",
    );
    conn.commit();
  } catch (error) {
    conn.rollback();
    throw error;
  }

  db.checkpoint();

  const counts = conn
    .query("MATCH (n) RETURN labels(n) AS labels, count(*) AS count")
    .rows.reduce<Record<string, number>>((acc, row) => {
      const label = String((row.labels as string[])[0] ?? "Unknown");
      acc[label] = Number(row.count);
      return acc;
    }, {});

  const relationships = conn.query(
    "MATCH ()-[r]->() RETURN type(r) AS type, count(*) AS count",
  ).rows;
  const noteCount = notes.length;
  const decisionCount = notes.reduce((sum, note) => sum + (note.decisions?.length ?? 0), 0);

  console.log(`Seed store: ${STORE}`);
  console.log(`Notes: ${noteCount}  Decisions: ${decisionCount}  Superseded: ${supersededBy.size}`);
  console.log("Nodes:", counts);
  console.log(
    "Relationships:",
    Object.fromEntries(relationships.map((row) => [row.type, Number(row.count)])),
  );
};

await run();
