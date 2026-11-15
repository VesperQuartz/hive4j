import type { Connection } from "@relate/relate";
import type {
  CreateDecisionInput,
  CreateDecisionResponse,
  CreateEntityInput,
  CreateEntityResponse,
  CreateNoteInput,
  CreateNoteResponse,
  Library,
  LibraryDecision,
  LibraryNote,
  PersonRef,
  ProjectRef,
} from "./types";

const text = (value: unknown) => String(value ?? "");

const shortId = () => crypto.randomUUID().slice(0, 6);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

const requireNode = (conn: Connection, label: "Person" | "Project", id: string) => {
  const row = conn.query(`MATCH (n:${label} {id: $id}) RETURN n.id AS id`, { id }).rows[0];
  if (!row) throw new Error(`That ${label.toLowerCase()} is not in the graph.`);
  return text(row.id);
};

export const getLibrary = (conn: Connection): Library => {
  const people = conn
    .query("MATCH (p:Person) RETURN p.id AS id, p.name AS name ORDER BY p.name")
    .rows.map((row) => ({ id: text(row.id), name: text(row.name) })) as PersonRef[];
  const projects = conn
    .query("MATCH (p:Project) RETURN p.id AS id, p.name AS name ORDER BY p.name")
    .rows.map((row) => ({ id: text(row.id), name: text(row.name) })) as ProjectRef[];

  const noteAuthors = new Map<string, PersonRef>();
  for (const row of conn.query(
    "MATCH (n:Note)-[:AUTHORED_BY]->(p:Person) RETURN n.id AS noteId, p.id AS id, p.name AS name",
  ).rows) {
    noteAuthors.set(text(row.noteId), { id: text(row.id), name: text(row.name) });
  }

  const noteProjects = new Map<string, ProjectRef[]>();
  for (const row of conn.query(
    "MATCH (n:Note)-[:MENTIONS]->(p:Project) RETURN n.id AS noteId, p.id AS id, p.name AS name",
  ).rows) {
    const key = text(row.noteId);
    const list = noteProjects.get(key) ?? [];
    list.push({ id: text(row.id), name: text(row.name) });
    noteProjects.set(key, list);
  }

  const noteDecisions = new Map<string, { id: string; text: string; status: string }[]>();
  for (const row of conn.query(
    "MATCH (n:Note)-[:STATES]->(d:Decision) RETURN n.id AS noteId, d.id AS id, d.text AS text, d.status AS status",
  ).rows) {
    const key = text(row.noteId);
    const list = noteDecisions.get(key) ?? [];
    list.push({ id: text(row.id), text: text(row.text), status: text(row.status) });
    noteDecisions.set(key, list);
  }

  const notes = conn
    .query(
      "MATCH (n:Note) RETURN n.id AS id, n.title AS title, n.body AS body, n.date AS date ORDER BY n.date DESC, n.title",
    )
    .rows.map((row): LibraryNote => {
      const id = text(row.id);
      return {
        id,
        title: text(row.title),
        body: text(row.body),
        date: text(row.date),
        author: noteAuthors.get(id) ?? null,
        projects: noteProjects.get(id) ?? [],
        decisions: noteDecisions.get(id) ?? [],
      };
    });

  const decisionPeople = new Map<string, PersonRef>();
  for (const row of conn.query(
    "MATCH (d:Decision)-[:DECIDED_BY]->(p:Person) RETURN d.id AS decisionId, p.id AS id, p.name AS name",
  ).rows) {
    decisionPeople.set(text(row.decisionId), { id: text(row.id), name: text(row.name) });
  }

  const decisionProjects = new Map<string, ProjectRef[]>();
  for (const row of conn.query(
    "MATCH (d:Decision)-[:ABOUT]->(p:Project) RETURN d.id AS decisionId, p.id AS id, p.name AS name",
  ).rows) {
    const key = text(row.decisionId);
    const list = decisionProjects.get(key) ?? [];
    list.push({ id: text(row.id), name: text(row.name) });
    decisionProjects.set(key, list);
  }

  const statesNotes = new Map<string, { id: string; title: string }>();
  for (const row of conn.query(
    "MATCH (n:Note)-[:STATES]->(d:Decision) RETURN d.id AS decisionId, n.id AS id, n.title AS title",
  ).rows) {
    statesNotes.set(text(row.decisionId), { id: text(row.id), title: text(row.title) });
  }
  const contextNotes = new Map<string, { id: string; title: string }>();
  for (const row of conn.query(
    "MATCH (n:Note)-[:CONTEXT_FOR]->(d:Decision) RETURN d.id AS decisionId, n.id AS id, n.title AS title",
  ).rows) {
    contextNotes.set(text(row.decisionId), { id: text(row.id), title: text(row.title) });
  }

  const supersededBy = new Map<string, { id: string; text: string }>();
  for (const row of conn.query(
    "MATCH (new:Decision)-[:SUPERSEDES]->(old:Decision) RETURN old.id AS id, new.id AS newId, new.text AS text",
  ).rows) {
    supersededBy.set(text(row.id), { id: text(row.newId), text: text(row.text) });
  }

  const decisions = conn
    .query(
      "MATCH (d:Decision) RETURN d.id AS id, d.text AS text, d.reason AS reason, d.date AS date, d.status AS status ORDER BY d.date DESC",
    )
    .rows.map((row): LibraryDecision => {
      const id = text(row.id);
      return {
        id,
        text: text(row.text),
        reason: text(row.reason),
        date: text(row.date),
        status: text(row.status),
        person: decisionPeople.get(id) ?? null,
        projects: decisionProjects.get(id) ?? [],
        note: statesNotes.get(id) ?? contextNotes.get(id) ?? null,
        supersededBy: supersededBy.get(id) ?? null,
      };
    });

  return { notes, decisions, people, projects };
};

export const createNote = (conn: Connection, input: CreateNoteInput): CreateNoteResponse => {
  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 3) throw new Error("Give the note a title of at least 3 characters.");
  if (body.length < 10) throw new Error("Write at least a sentence in the note.");
  if (input.projectIds.length === 0) throw new Error("Choose at least one project.");

  const authorId = requireNode(conn, "Person", input.authorId);
  for (const projectId of input.projectIds) requireNode(conn, "Project", projectId);

  const decisionText = input.decision?.text.trim() ?? "";
  const decisionReason = input.decision?.reason.trim() ?? "";
  if (decisionText.length > 0) {
    if (decisionText.length < 5) throw new Error("The decision needs at least 5 characters.");
    if (decisionReason.length < 4) throw new Error("Add a reason for the decision.");
  }

  const date = new Date().toISOString().slice(0, 10);
  const noteId = `note-${date}-${slugify(title)}-${shortId()}`;
  const decisionId = decisionText ? `dec-${shortId()}` : null;

  conn.begin();
  try {
    conn.query(
      "CREATE (:Note {id: $id, title: $title, body: $body, date: $date, path: 'in-app'})",
      { id: noteId, title, body, date },
    );
    conn.query(
      "MATCH (n:Note {id: $note}), (p:Person {id: $person}) CREATE (n)-[:AUTHORED_BY]->(p)",
      {
        note: noteId,
        person: authorId,
      },
    );
    for (const projectId of input.projectIds) {
      conn.query(
        "MATCH (n:Note {id: $note}), (p:Project {id: $project}) CREATE (n)-[:MENTIONS]->(p)",
        {
          note: noteId,
          project: projectId,
        },
      );
    }

    if (decisionId) {
      conn.query(
        `CREATE (:Decision {
          id: $id, text: $text, reason: $reason, date: $date,
          status: 'active', validFrom: $date, validTo: null
        })`,
        { id: decisionId, text: decisionText, reason: decisionReason, date },
      );
      conn.query(
        "MATCH (n:Note {id: $note}), (d:Decision {id: $decision}) CREATE (n)-[:STATES]->(d)",
        {
          note: noteId,
          decision: decisionId,
        },
      );
      conn.query(
        "MATCH (d:Decision {id: $decision}), (p:Person {id: $person}) CREATE (d)-[:DECIDED_BY]->(p)",
        {
          decision: decisionId,
          person: authorId,
        },
      );
      for (const projectId of input.projectIds) {
        conn.query(
          "MATCH (d:Decision {id: $decision}), (p:Project {id: $project}) CREATE (d)-[:ABOUT]->(p)",
          {
            decision: decisionId,
            project: projectId,
          },
        );
      }
    }
    conn.commit();
  } catch (error) {
    conn.rollback();
    throw error;
  }

  return { noteId, decisionId };
};

export const createDecision = (
  conn: Connection,
  input: CreateDecisionInput,
): CreateDecisionResponse => {
  const decisionText = input.text.trim();
  const reason = input.reason.trim();
  if (decisionText.length < 5) throw new Error("The decision needs at least 5 characters.");
  if (reason.length < 4) throw new Error("Add a reason for the decision.");

  const personId = requireNode(conn, "Person", input.personId);
  const projectId = requireNode(conn, "Project", input.projectId);

  const date = new Date().toISOString().slice(0, 10);
  const decisionId = `dec-${shortId()}`;
  let noteId = input.noteId?.trim() ?? "";

  if (noteId) {
    const existing = conn.query("MATCH (n:Note {id: $id}) RETURN n.id AS id", { id: noteId })
      .rows[0];
    if (!existing) throw new Error("That source note is not in the graph.");
  }

  conn.begin();
  try {
    if (!noteId) {
      noteId = `note-${date}-decision-log-${shortId()}`;
      conn.query(
        "CREATE (:Note {id: $id, title: $title, body: $body, date: $date, path: 'in-app'})",
        {
          id: noteId,
          title: `Decision log — ${date}`,
          body: `Recorded in Hive.\n\n${decisionText}\n\nWhy: ${reason}`,
          date,
        },
      );
      conn.query(
        "MATCH (n:Note {id: $note}), (p:Person {id: $person}) CREATE (n)-[:AUTHORED_BY]->(p)",
        {
          note: noteId,
          person: personId,
        },
      );
      conn.query(
        "MATCH (n:Note {id: $note}), (p:Project {id: $project}) CREATE (n)-[:MENTIONS]->(p)",
        {
          note: noteId,
          project: projectId,
        },
      );
    }

    conn.query(
      `CREATE (:Decision {
        id: $id, text: $text, reason: $reason, date: $date,
        status: 'active', validFrom: $date, validTo: null
      })`,
      { id: decisionId, text: decisionText, reason, date },
    );
    conn.query(
      "MATCH (n:Note {id: $note}), (d:Decision {id: $decision}) CREATE (n)-[:STATES]->(d)",
      {
        note: noteId,
        decision: decisionId,
      },
    );
    conn.query(
      "MATCH (d:Decision {id: $decision}), (p:Person {id: $person}) CREATE (d)-[:DECIDED_BY]->(p)",
      {
        decision: decisionId,
        person: personId,
      },
    );
    conn.query(
      "MATCH (d:Decision {id: $decision}), (p:Project {id: $project}) CREATE (d)-[:ABOUT]->(p)",
      {
        decision: decisionId,
        project: projectId,
      },
    );
    conn.commit();
  } catch (error) {
    conn.rollback();
    throw error;
  }

  return { decisionId, noteId };
};

export const createEntity = (conn: Connection, input: CreateEntityInput): CreateEntityResponse => {
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Give it a name of at least 2 characters.");

  const label = input.kind === "person" ? "Person" : "Project";
  const existing = conn.query(`MATCH (n:${label} {name: $name}) RETURN n.id AS id`, { name })
    .rows[0];
  if (existing) throw new Error(`A ${label.toLowerCase()} named “${name}” already exists.`);

  const id = `${input.kind}-${slugify(name)}-${shortId()}`;
  conn.query(`CREATE (:${label} {id: $id, name: $name})`, { id, name });
  return { id, name, kind: input.kind };
};
