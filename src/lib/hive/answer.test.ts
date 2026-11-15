import { describe, expect, it } from "vite-plus/test";
import { composeAnswer } from "./answer";
import type { HiveBundle, HiveNode } from "./types";

const node = (partial: Partial<HiveNode> & Pick<HiveNode, "id" | "label" | "title">): HiveNode => ({
  text: "",
  date: "",
  status: "",
  reason: "",
  hops: 1,
  score: 1,
  ...partial,
});

const bundle = (
  nodes: HiveNode[],
  edges: HiveBundle["edges"],
  anchorId: string | null,
): HiveBundle => ({
  question: "Why did we move off Auth0?",
  search: "move auth0",
  seeds: [{ id: "note-1", title: "Northwind call", score: 1 }],
  nodes,
  edges,
  anchorId,
  tokens: 100,
  budget: 1400,
  usedIds: nodes.map((entry) => entry.id),
});

describe("composeAnswer", () => {
  it("names the active decision, the reason, the decision it replaced, and the note", () => {
    const answer = composeAnswer(
      bundle(
        [
          node({
            id: "note-1",
            label: "Note",
            title: "Northwind call",
            text: "The security review asked for SAML.",
            date: "2026-05-14",
          }),
          node({
            id: "dec-1",
            label: "Decision",
            title: "Use Auth0",
            text: "Use Auth0",
            status: "superseded",
            date: "2026-03-02",
          }),
          node({
            id: "dec-2",
            label: "Decision",
            title: "Move to Okta",
            text: "Move to Okta",
            status: "active",
            reason: "Three deals need SSO.",
            date: "2026-05-14",
          }),
          node({ id: "person-1", label: "Person", title: "Sam Okafor" }),
        ],
        [
          { from: "note-1", to: "dec-2", rel: "STATES" },
          { from: "dec-2", to: "person-1", rel: "DECIDED_BY" },
          { from: "dec-2", to: "dec-1", rel: "SUPERSEDES" },
        ],
        "dec-2",
      ),
    );

    expect(answer.segments[0]?.text).toContain("Move to Okta");
    expect(answer.segments[0]?.text).toContain("Sam Okafor");
    expect(answer.segments[1]?.text).toContain("Three deals need SSO");
    expect(answer.segments[2]?.text).toContain("Use Auth0");
    expect(answer.segments[3]?.text).toContain("Northwind call");
    expect(answer.segments[0]?.cites).toEqual(["dec-2", "person-1"]);
  });

  it("says so when the graph has notes but no decision", () => {
    const answer = composeAnswer(
      bundle([node({ id: "note-1", label: "Note", title: "A note" })], [], null),
    );
    expect(answer.segments[0]?.text).toContain("no decision is recorded");
  });

  it("says so when nothing matches", () => {
    const answer = composeAnswer(bundle([], [], null));
    expect(answer.segments[0]?.text).toContain("no notes matching");
  });
});
