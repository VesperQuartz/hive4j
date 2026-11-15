import { useState } from "react";
import { ContextGraph } from "@/components/hive/context-graph";
import type { HiveBundle } from "@/lib/hive/types";

const bundle: HiveBundle = {
  question: "Why did we move off Auth0?",
  search: "move auth0",
  seeds: [{ id: "note-northwind", title: "Northwind call — SSO is a dealbreaker", score: 1 }],
  nodes: [
    {
      id: "note-northwind",
      label: "Note",
      title: "Northwind call — SSO is a dealbreaker",
      text: "The security review asked for SAML SSO and SCIM provisioning.",
      date: "2026-05-14",
      status: "",
      reason: "",
      hops: 0,
      score: 1.2,
    },
    {
      id: "dec-okta",
      label: "Decision",
      title: "Move from Auth0 to Okta for enterprise SSO",
      text: "Move from Auth0 to Okta for enterprise SSO.",
      date: "2026-05-14",
      status: "active",
      reason: "Three enterprise deals require SAML SSO and SCIM provisioning.",
      hops: 1,
      score: 1.1,
    },
    {
      id: "dec-auth0",
      label: "Decision",
      title: "Use Auth0 for authentication",
      text: "Use Auth0 for authentication.",
      date: "2026-03-02",
      status: "superseded",
      reason: "Fastest path to email, Google, and password reset.",
      hops: 2,
      score: 0.8,
    },
    {
      id: "person-sam",
      label: "Person",
      title: "Sam Okafor",
      text: "Sam Okafor",
      date: "",
      status: "",
      reason: "",
      hops: 1,
      score: 0.6,
    },
    {
      id: "project-rill",
      label: "Project",
      title: "Rill",
      text: "Rill",
      date: "",
      status: "",
      reason: "",
      hops: 1,
      score: 0.6,
    },
  ],
  edges: [
    { from: "note-northwind", to: "dec-okta", rel: "STATES" },
    { from: "dec-okta", to: "person-sam", rel: "DECIDED_BY" },
    { from: "dec-okta", to: "project-rill", rel: "ABOUT" },
    { from: "dec-okta", to: "dec-auth0", rel: "SUPERSEDES" },
  ],
  anchorId: "dec-okta",
  tokens: 412,
  budget: 1400,
  usedIds: ["note-northwind", "dec-okta", "dec-auth0", "person-sam", "project-rill"],
};

export const DemoGraph = () => {
  const [selectedId, setSelectedId] = useState("dec-okta");

  return (
    <>
      <div className="hidden sm:block">
        <ContextGraph bundle={bundle} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <div className="sm:hidden">
        <ul className="space-y-2">
          {bundle.nodes.map((node) => (
            <li key={node.id} className="flex items-start gap-2">
              <span
                className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                  node.label === "Decision"
                    ? node.status === "active"
                      ? "bg-primary"
                      : "bg-muted-foreground/40"
                    : "bg-foreground/30"
                }`}
              />
              <span className="min-w-0">
                <span className="block text-xs font-medium leading-5">{node.title}</span>
                <span className="block text-[10px] text-muted-foreground">
                  {node.label}
                  {node.status ? `, ${node.status}` : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
          The demo lets you click through the full bundle.
        </p>
      </div>
    </>
  );
};
