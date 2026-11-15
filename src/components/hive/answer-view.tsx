import { cn } from "@/lib/utils";
import type { HiveAnswer, HiveBundle } from "@/lib/hive/types";

export const AnswerView = ({
  answer,
  bundle,
  citationIndex,
  selectedId,
  onSelect,
}: {
  answer: HiveAnswer;
  bundle: HiveBundle;
  citationIndex: Map<string, number>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) => {
  const byId = new Map(bundle.nodes.map((node) => [node.id, node]));

  return (
    <section aria-live="polite" aria-label="Answer">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold">Answer</h2>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          evidence mode
        </span>
      </div>

      <div className="mt-4 space-y-5">
        {answer.segments.map((segment, index) => (
          <div key={`${answer.id}-${index}`}>
            <p
              className={cn(
                index === 0
                  ? "font-serif text-xl leading-8 tracking-[-0.01em] text-foreground"
                  : "max-w-[70ch] text-sm leading-6 text-foreground/85",
              )}
            >
              {segment.text}
            </p>
            {segment.cites.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {segment.cites.map((id) => {
                  const node = byId.get(id);
                  const number = citationIndex.get(id);
                  if (!node || !number) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onSelect(id)}
                      title={node.title}
                      aria-label={`Citation ${number}: ${node.title}`}
                      className={cn(
                        "inline-flex size-5 items-center justify-center rounded-full border text-[10px] tabular-nums transition-colors",
                        selectedId === id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                      )}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <p className="mt-5 text-[11px] text-muted-foreground">
        Composed from graph paths. No model is called.
      </p>
    </section>
  );
};
