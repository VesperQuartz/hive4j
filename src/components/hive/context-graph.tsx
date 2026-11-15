import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { HiveBundle, HiveLabel, HiveNode } from "@/lib/hive/types";

const COLUMN: Record<HiveLabel, number> = {
  Note: 0,
  Decision: 1,
  Person: 2,
  Project: 2,
};

const COLUMN_X = [18, 244, 470];
const NODE_WIDTH = 152;
const NODE_HEIGHT = 34;
const ROW = 48;

const clip = (value: string, limit = 21) =>
  value.length > limit ? `${value.slice(0, limit - 1)}…` : value;

const fillFor = (node: HiveNode) => {
  if (node.label === "Decision") {
    return node.status === "active"
      ? "color-mix(in oklch, var(--primary) 14%, var(--card))"
      : "var(--card)";
  }
  if (node.label === "Person" || node.label === "Project") return "var(--accent)";
  return "var(--muted)";
};

export const ContextGraph = ({
  bundle,
  selectedId,
  onSelect,
}: {
  bundle: HiveBundle;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) => {
  const layout = useMemo(() => {
    const selected = bundle.nodes.find((node) => node.id === selectedId) ?? bundle.nodes[0];
    if (!selected) return null;

    const egoEdges = bundle.edges.filter(
      (edge) => edge.from === selected.id || edge.to === selected.id,
    );
    const neighborIds = new Set(
      egoEdges.map((edge) => (edge.from === selected.id ? edge.to : edge.from)),
    );
    const visible = bundle.nodes
      .filter((node) => node.id === selected.id || neighborIds.has(node.id))
      .slice(0, 8);

    const columns: Record<number, HiveNode[]> = { 0: [], 1: [], 2: [] };
    for (const node of visible) columns[COLUMN[node.label]].push(node);
    for (const column of Object.keys(columns).map(Number)) {
      columns[column].sort((a, b) => {
        if (a.id === selected.id) return -1;
        if (b.id === selected.id) return 1;
        if (a.label === "Decision" && b.label === "Decision") {
          return (
            Number(b.status === "active") - Number(a.status === "active") ||
            b.date.localeCompare(a.date)
          );
        }
        return b.score - a.score;
      });
    }

    const positions = new Map<string, { x: number; y: number }>();
    for (const column of Object.keys(columns).map(Number)) {
      const nodes = columns[column];
      const start = 130 - ((nodes.length - 1) * ROW) / 2;
      nodes.forEach((node, index) => {
        positions.set(node.id, { x: COLUMN_X[column], y: start + index * ROW });
      });
    }

    return { selected, visible, edges: egoEdges, positions };
  }, [bundle, selectedId]);

  if (!layout) return null;

  return (
    <figure>
      <svg viewBox="0 0 640 260" className="h-auto w-full" role="presentation" aria-hidden="true">
        {layout.edges.map((edge) => {
          const from = layout.positions.get(edge.from);
          const to = layout.positions.get(edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={`${edge.from}|${edge.rel}|${edge.to}`}
              x1={from.x + NODE_WIDTH / 2}
              y1={from.y + NODE_HEIGHT / 2}
              x2={to.x + NODE_WIDTH / 2}
              y2={to.y + NODE_HEIGHT / 2}
              stroke="var(--primary)"
              strokeWidth={1.4}
              strokeOpacity={0.55}
            />
          );
        })}

        {layout.visible.map((node) => {
          const position = layout.positions.get(node.id);
          if (!position) return null;
          const selected = node.id === layout.selected.id;
          return (
            <g
              key={node.id}
              transform={`translate(${position.x} ${position.y})`}
              onClick={() => onSelect(node.id)}
              className="cursor-pointer"
            >
              <rect
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={7}
                fill={fillFor(node)}
                stroke={selected ? "var(--primary)" : "var(--border)"}
                strokeWidth={selected ? 2 : 1}
                strokeDasharray={
                  node.label === "Decision" && node.status === "superseded" ? "4 3" : undefined
                }
              />
              <text
                x={NODE_WIDTH / 2}
                y={NODE_HEIGHT / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10.5}
                fill={
                  node.status === "superseded" ? "var(--muted-foreground)" : "var(--foreground)"
                }
              >
                {clip(node.title)}
              </text>
              <title>{`${node.label}: ${node.title}`}</title>
            </g>
          );
        })}
      </svg>

      <figcaption className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-muted ring-1 ring-border" /> Note
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-primary/15 ring-1 ring-primary" /> Active decision
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-card ring-1 ring-border" /> Superseded
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-accent ring-1 ring-border" /> Person or project
        </span>
        <span className={cn("ml-auto", selectedId ? "text-foreground" : "")}>
          Click a node to follow it
        </span>
      </figcaption>
    </figure>
  );
};
