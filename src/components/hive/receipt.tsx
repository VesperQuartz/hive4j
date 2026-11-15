import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CorrectionForm, type CorrectionInput } from "@/components/hive/correction-form";
import { cn } from "@/lib/utils";
import type { HiveBundle, HiveNode } from "@/lib/hive/types";

const NodeRow = ({
  node,
  selected,
  citation,
  onSelect,
}: {
  node: HiveNode;
  selected: boolean;
  citation?: number;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
      selected ? "bg-accent" : "hover:bg-muted",
    )}
  >
    <span
      className={cn(
        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border text-[9px] tabular-nums",
        citation
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted-foreground",
      )}
    >
      {citation ?? "·"}
    </span>
    <span className="min-w-0 flex-1">
      <span className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-xs font-medium leading-4">{node.title}</span>
        {node.label === "Decision" ? (
          <Badge
            variant={node.status === "active" ? "secondary" : "outline"}
            className="mt-0.5 shrink-0 text-[10px]"
          >
            {node.status}
          </Badge>
        ) : null}
      </span>
      <span className="mt-0.5 block text-[10px] text-muted-foreground">
        {node.label}
        {node.date ? ` · ${node.date}` : ""}
      </span>
    </span>
  </button>
);

export const Receipt = ({
  bundle,
  citationIndex,
  selectedId,
  onSelect,
  onCorrect,
}: {
  bundle: HiveBundle;
  citationIndex: Map<string, number>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCorrect: (input: CorrectionInput) => Promise<void>;
}) => {
  const [editing, setEditing] = useState(false);
  const selected = bundle.nodes.find((node) => node.id === selectedId) ?? null;
  const percent = Math.min(100, Math.round((bundle.tokens / bundle.budget) * 100));

  const groups = useMemo(() => {
    const decisions = bundle.nodes
      .filter((node) => node.label === "Decision")
      .sort((a, b) => Number(b.status === "active") - Number(a.status === "active"));
    const notes = bundle.nodes.filter((node) => node.label === "Note");
    const entities = bundle.nodes.filter(
      (node) => node.label === "Person" || node.label === "Project",
    );

    return [
      { title: "Decisions", nodes: decisions },
      { title: "Notes", nodes: notes },
      { title: "People and projects", nodes: entities },
    ].filter((group) => group.nodes.length > 0);
  }, [bundle.nodes]);

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg font-semibold">Receipt</h2>
          <p className="text-[11px] text-muted-foreground">
            {bundle.nodes.length} nodes · {bundle.edges.length} edges
          </p>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {bundle.tokens} / {bundle.budget}
        </span>
      </div>

      <div
        className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Context budget used"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground">
        seeded with{" "}
        <span className="rounded bg-muted px-1 py-0.5 text-foreground">{bundle.search}</span>
      </p>

      {selected ? (
        <div className="mt-3 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {selected.label}
            </span>
            {selected.label === "Decision" ? (
              <Badge variant={selected.status === "active" ? "secondary" : "outline"}>
                {selected.status}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 font-serif text-sm font-semibold leading-5">{selected.title}</p>
          {selected.label === "Decision" ? (
            <>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{selected.reason}</p>
              <p className="mt-2 text-[10px] text-muted-foreground">
                {selected.date}
                {selected.status === "superseded" ? " · replaced by a later decision" : ""}
              </p>
              {selected.status === "active" ? (
                editing ? (
                  <CorrectionForm
                    key={selected.id}
                    decision={selected}
                    onSubmit={async (input) => {
                      await onCorrect(input);
                      setEditing(false);
                    }}
                    onCancel={() => setEditing(false)}
                  />
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => setEditing(true)}
                  >
                    Correct this decision
                  </Button>
                )
              ) : null}
            </>
          ) : null}
          {selected.label === "Note" ? (
            <>
              <p className="mt-2 max-h-40 overflow-y-auto text-[11px] leading-5 text-muted-foreground">
                {selected.text}
              </p>
              <p className="mt-2 text-[10px] text-muted-foreground">{selected.date}</p>
            </>
          ) : null}
          {selected.label === "Person" || selected.label === "Project" ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Connected through the selected decisions.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 max-h-[42svh] space-y-3 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="px-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {group.title}
            </h3>
            <div className="mt-1 space-y-0.5">
              {group.nodes.map((node) => (
                <NodeRow
                  key={node.id}
                  node={node}
                  citation={citationIndex.get(node.id)}
                  selected={node.id === selectedId}
                  onSelect={() => onSelect(node.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
