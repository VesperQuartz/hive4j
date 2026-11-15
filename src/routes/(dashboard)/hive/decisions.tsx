import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CorrectionDialog } from "@/components/hive/correction-dialog";
import { DecisionDialog } from "@/components/hive/decision-dialog";
import { PageHeader } from "@/components/hive/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { libraryQuery } from "@/lib/hive/client";
import { cn } from "@/lib/utils";
import type { LibraryDecision } from "@/lib/hive/types";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "superseded", label: "Superseded" },
] as const;

const DecisionsPage = () => {
  const library = useQuery(libraryQuery);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [correcting, setCorrecting] = useState<LibraryDecision | null>(null);

  const decisions = useMemo(() => library.data?.decisions ?? [], [library.data?.decisions]);
  const filtered = useMemo(
    () =>
      filter === "all" ? decisions : decisions.filter((decision) => decision.status === filter),
    [decisions, filter],
  );
  const active = decisions.filter((decision) => decision.status === "active").length;
  const superseded = decisions.length - active;

  return (
    <>
      <PageHeader
        kicker="Decision register"
        title="Decisions"
        description="What the team actually chose, why, and what it replaced. A correction adds a new decision and a SUPERSEDES edge; the old one stays."
        action={<Button onClick={() => setDialogOpen(true)}>New decision</Button>}
      />

      <div className="mt-6 max-w-[58rem]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs transition-colors",
                  filter === item.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
                <span className="ml-1.5 tabular-nums opacity-60">
                  {library.isLoading
                    ? "—"
                    : item.value === "all"
                      ? decisions.length
                      : item.value === "active"
                        ? active
                        : superseded}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {library.isLoading ? "reading…" : `${active} active · ${superseded} superseded`}
          </p>
        </div>

        {library.isLoading ? (
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="h-32 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : null}

        {library.error ? (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {library.error instanceof Error
              ? library.error.message
              : "The decisions could not be read."}
          </p>
        ) : null}

        {!library.isLoading && filtered.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="font-serif text-lg font-semibold">
              {decisions.length === 0 ? "No decisions yet" : "No decisions in this filter"}
            </p>
            <p className="mx-auto mt-1 max-w-[40ch] text-sm text-muted-foreground">
              {decisions.length === 0
                ? "Add a decision. It needs a person, a project, and a source note."
                : "Switch the filter to see the rest of the register."}
            </p>
            {decisions.length === 0 ? (
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                New decision
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {filtered.map((decision) => {
            const isActive = decision.status === "active";
            return (
              <article
                key={decision.id}
                className={cn(
                  "rounded-xl border bg-card p-4",
                  isActive ? "border-border" : "border-dashed border-border/80",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          isActive ? "bg-primary" : "bg-muted-foreground/40",
                        )}
                      />
                      <Badge variant={isActive ? "secondary" : "outline"}>{decision.status}</Badge>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {decision.date}
                      </span>
                    </div>

                    <h3 className="mt-2 font-serif text-lg font-semibold leading-6">
                      {decision.text}
                    </h3>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {decision.person?.name ?? "Unknown"}
                      {decision.projects.length > 0
                        ? ` · ${decision.projects.map((project) => project.name).join(", ")}`
                        : ""}
                    </p>

                    <p className="mt-2 max-w-[70ch] text-sm leading-6 text-muted-foreground">
                      {decision.reason}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-2 text-[11px] text-muted-foreground">
                      {decision.note ? <span>Source: {decision.note.title}</span> : null}
                      {decision.supersededBy ? (
                        <span className="text-foreground/70">
                          Replaced by “{decision.supersededBy.text}”
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {isActive ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setCorrecting(decision)}
                    >
                      Correct
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <DecisionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        people={library.data?.people ?? []}
        projects={library.data?.projects ?? []}
        notes={library.data?.notes ?? []}
        onCreated={() => setFilter("all")}
      />

      <CorrectionDialog
        open={correcting !== null}
        onOpenChange={(open) => {
          if (!open) setCorrecting(null);
        }}
        decision={correcting}
        onCorrected={() => setCorrecting(null)}
      />
    </>
  );
};

export const Route = createFileRoute("/(dashboard)/hive/decisions")({
  component: DecisionsPage,
  head: () => ({ meta: [{ title: "Decisions — Hive" }] }),
});
