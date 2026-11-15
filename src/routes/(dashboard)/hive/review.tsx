import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { PageHeader } from "@/components/hive/shell";
import { Button } from "@/components/ui/button";
import { overviewQuery } from "@/lib/hive/client";

const ReviewPage = () => {
  const overview = useQuery(overviewQuery);
  const navigate = useNavigate();
  const stale = overview.data?.stale ?? [];

  return (
    <>
      <PageHeader
        kicker="Answer review"
        title="Review"
        description="An answer is stale when the decision it asserted has since been superseded. It is not stale just because it mentioned an old decision as context."
        action={
          <Link
            to="/hive/decisions"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Open decisions
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3" />
          </Link>
        }
      />

      <div className="max-w-[58rem]">
        {overview.isLoading ? (
          <div className="mt-6 space-y-3">
            {[0, 1].map((key) => (
              <div
                key={key}
                className="h-24 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : null}

        {!overview.isLoading && stale.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-14 text-center">
            <p className="font-serif text-xl font-semibold">Nothing needs review</p>
            <p className="mx-auto mt-1 max-w-[44ch] text-sm leading-6 text-muted-foreground">
              Correct a decision and every answer that asserted it will land here. The old answer
              stays readable; it just stops being current.
            </p>
            <Button className="mt-4" nativeButton={false} render={<Link to="/hive/decisions" />}>
              Go to decisions
            </Button>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {stale.map((item) => (
            <article key={item.id} className="rounded-xl border border-primary/25 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {new Date(item.at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-semibold leading-6">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Asserted “{item.decisions[0]}”, which has since been superseded.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() =>
                    navigate({ to: "/hive", search: { q: item.question, t: Date.now() } })
                  }
                >
                  Ask again
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
};

export const Route = createFileRoute("/(dashboard)/hive/review")({
  component: ReviewPage,
  head: () => ({ meta: [{ title: "Review — Hive" }] }),
});
