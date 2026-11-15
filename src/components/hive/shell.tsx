import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Note01Icon, Search01Icon, Task01Icon } from "@hugeicons/core-free-icons";
import { overviewQuery } from "@/lib/hive/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/hive", label: "Ask", icon: Search01Icon },
  { to: "/hive/notes", label: "Notes", icon: Note01Icon },
  { to: "/hive/decisions", label: "Decisions", icon: Task01Icon },
  { to: "/hive/review", label: "Review", icon: Alert02Icon },
] as const;

export const HiveShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const overview = useQuery(overviewQuery);
  const stats = overview.data?.stats;
  const stale = overview.data?.stale.length ?? 0;

  const isActive = (to: string) =>
    to === "/hive" ? pathname === "/hive" : pathname.startsWith(to);

  return (
    <div className="hive min-h-svh bg-background text-foreground">
      <div className="mx-auto flex min-h-svh max-w-[90rem]">
        <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-white/10 bg-[oklch(0.235_0.012_60)] px-4 py-6 text-[oklch(0.93_0.01_90)] lg:flex">
          <Link to="/hive" className="flex items-center gap-2.5 px-2">
            <img src="/hive.png" alt="" className="size-8" />
            <span className="font-serif text-2xl font-semibold tracking-tight">Hive</span>
          </Link>
          <p className="mt-1 px-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
            Decision memory
          </p>

          <nav className="mt-8 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive(item.to)
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white",
                )}
              >
                <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-4" />
                <span>{item.label}</span>
                {item.to === "/hive/review" && stale > 0 ? (
                  <span className="ml-auto rounded-full bg-[oklch(0.62_0.17_35)] px-1.5 text-[10px] font-medium text-white">
                    {stale}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="rounded-xl border border-white/10 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Workspace</p>
              <dl className="mt-2 space-y-1.5 text-xs text-white/50">
                <div className="flex items-baseline justify-between gap-2">
                  <dt>Notes</dt>
                  <dd className="tabular-nums text-white/90">{stats?.notes ?? "—"}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt>Decisions</dt>
                  <dd className="tabular-nums text-white/90">{stats?.decisions ?? "—"}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt>Superseded</dt>
                  <dd className="tabular-nums text-white/90">{stats?.superseded ?? "—"}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt>Answers</dt>
                  <dd className="tabular-nums text-white/90">{stats?.answers ?? "—"}</dd>
                </div>
              </dl>
            </div>
            <a
              href="https://relatedb.ai"
              target="_blank"
              rel="noreferrer"
              className="block px-2 text-[11px] text-white/35 transition-colors hover:text-white/70"
            >
              Relate 1.0.1 · embedded graph ↗
            </a>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <Link to="/hive" className="flex items-center gap-2">
                <img src="/hive.png" alt="" className="size-7" />
                <span className="font-serif text-xl font-semibold tracking-tight">Hive</span>
              </Link>
              <span className="text-[11px] text-muted-foreground">
                {stats ? `${stats.notes} notes` : "reading…"}
              </span>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs",
                    isActive(item.to)
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-3.5" />
                  {item.label}
                  {item.to === "/hive/review" && stale > 0 ? (
                    <span className="rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                      {stale}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>

          <main className="px-4 py-8 sm:px-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
};

export const PageHeader = ({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{kicker}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 max-w-[62ch] text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
    {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
  </header>
);
