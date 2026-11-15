import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnswerView } from "@/components/hive/answer-view";
import { ContextGraph } from "@/components/hive/context-graph";
import { Receipt } from "@/components/hive/receipt";
import { PageHeader } from "@/components/hive/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { overviewQuery, postJson } from "@/lib/hive/client";
import { buildCitationIndex } from "@/lib/hive/citations";
import { SUGGESTED_QUESTIONS, type AskResponse } from "@/lib/hive/types";
import type { CorrectionInput } from "@/components/hive/correction-form";
import { cn } from "@/lib/utils";

const AskPage = () => {
  const queryClient = useQueryClient();
  const overview = useQuery(overviewQuery);
  const { q, t } = Route.useSearch();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastAsked = useRef<string | null>(null);
  const inFlight = useRef(false);

  const ask = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || inFlight.current) return;
      inFlight.current = true;
      setPending(true);
      setError(null);
      try {
        const data = await postJson<AskResponse>("/api/hive/ask", { question: trimmed });
        setResult(data);
        setSelectedId(data.bundle.anchorId ?? data.bundle.nodes[0]?.id ?? null);
        setQuestion(trimmed);
        await queryClient.invalidateQueries({ queryKey: ["hive", "overview"] });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "The graph could not answer that.");
      } finally {
        inFlight.current = false;
        setPending(false);
      }
    },
    [queryClient],
  );

  useEffect(() => {
    const key = `${q ?? ""}|${t ?? ""}`;
    if (q && lastAsked.current !== key) {
      lastAsked.current = key;
      void ask(q);
    }
  }, [q, t, ask]);

  const citationIndex = useMemo(
    () => (result ? buildCitationIndex(result.bundle, result.answer) : new Map<string, number>()),
    [result],
  );

  const correct = async (input: CorrectionInput) => {
    await postJson("/api/hive/correct", input);
    await queryClient.invalidateQueries({ queryKey: ["hive", "overview"] });
    toast.success("Correction saved. The old decision is superseded, not deleted.");
    await ask(result?.answer.question ?? question);
  };

  const stale = overview.data?.stale ?? [];
  const stats = overview.data?.stats;

  return (
    <>
      <PageHeader
        kicker="Decision memory"
        title="Ask the ledger."
        description="Ask a question about a decision. Hive finds the notes, follows the relationships, and shows the exact context it used."
        action={
          <Link
            to="/hive/review"
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                stale.length > 0 ? "bg-primary" : "bg-muted-foreground/40",
              )}
            />
            {stale.length > 0 ? `${stale.length} to review` : "Nothing to review"}
          </Link>
        }
      />

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-5">
          <Card className="gap-0 border-border/80 shadow-none">
            <CardContent>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void ask(question);
                }}
              >
                <label htmlFor="hive-question" className="sr-only">
                  Ask a question about a decision
                </label>
                <Textarea
                  id="hive-question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                      event.preventDefault();
                      void ask(question);
                    }
                  }}
                  placeholder="Why did we move off Auth0?"
                  className="min-h-20 resize-none border-0 bg-transparent px-0 text-lg shadow-none focus-visible:ring-0"
                  autoComplete="off"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <p className="text-[11px] text-muted-foreground">
                    {pending ? "Reading the graph…" : "⌘↵ to ask"}
                  </p>
                  <Button type="submit" disabled={pending || question.trim().length === 0}>
                    {pending ? "Reading…" : "Ask"}
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
                  </Button>
                </div>
              </form>

              {result ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={pending}
                      onClick={() => void ask(suggestion)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-50",
                        result.answer.question === suggestion
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}

              {error ? (
                <p
                  role="alert"
                  className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
                >
                  {error}
                </p>
              ) : null}
            </CardContent>
          </Card>

          {result ? (
            <>
              <Card className="gap-0 border-border/80 shadow-none">
                <CardContent>
                  <AnswerView
                    answer={result.answer}
                    bundle={result.bundle}
                    citationIndex={citationIndex}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
                    <span>
                      {result.bundle.nodes.length} nodes · {result.bundle.edges.length} edges ·{" "}
                      {result.bundle.tokens} / {result.bundle.budget} tokens
                    </span>
                    <span className="font-mono">{result.answer.id}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="gap-0 border-border/80 shadow-none">
                <CardContent>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-serif text-lg font-semibold">Why this answer</h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        The selected node and its one-hop neighbors. The full bundle is in the
                        receipt.
                      </p>
                    </div>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                      {result.bundle.anchorId ? "anchored" : "context"}
                    </span>
                  </div>
                  <div className="mt-3">
                    <ContextGraph
                      bundle={result.bundle}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  question: "Why did we move off Auth0?",
                  meta: "Identity · May 2026",
                },
                {
                  question: "What did we decide about pricing?",
                  meta: "Pricing · Sep 2026",
                },
                {
                  question: "Why did we leave Vercel?",
                  meta: "Hosting · Sep 2026",
                },
              ].map((item) => (
                <button
                  key={item.question}
                  type="button"
                  onClick={() => void ask(item.question)}
                  disabled={pending}
                  className="group rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent/40 disabled:opacity-50"
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {item.meta}
                  </p>
                  <p className="mt-2 font-serif text-lg leading-6">{item.question}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
                    Ask this
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {stale.length > 0 ? (
            <Link
              to="/hive/review"
              className="flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm transition-colors hover:bg-primary/10"
            >
              <span>
                <span className="font-medium">
                  {stale.length} {stale.length === 1 ? "answer needs" : "answers need"} review
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  A decision they asserted has since been superseded.
                </span>
              </span>
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4 shrink-0" />
            </Link>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-6">
          <Card className="gap-0 border-border/80 shadow-none">
            <CardContent>
              {result ? (
                <Receipt
                  bundle={result.bundle}
                  citationIndex={citationIndex}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onCorrect={correct}
                />
              ) : (
                <div>
                  <h2 className="font-serif text-lg font-semibold">Receipt</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Every answer shows the nodes it used, the paths between them, and how much of
                    the budget it spent.
                  </p>
                  <dl className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Store</dt>
                      <dd className="font-mono text-[11px]">data/run/hive.rl</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Mode</dt>
                      <dd>evidence · no model</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Budget</dt>
                      <dd className="font-mono text-[11px]">1,400 tokens</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Graph</dt>
                      <dd className="tabular-nums">
                        {stats ? `${stats.nodes} nodes` : "reading…"}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
};

export const Route = createFileRoute("/(dashboard)/hive/")({
  component: AskPage,
  validateSearch: (search: Record<string, unknown>): { q?: string; t?: number } => ({
    ...(typeof search.q === "string" ? { q: search.q } : {}),
    ...(typeof search.t === "number" ? { t: search.t } : {}),
  }),
});
