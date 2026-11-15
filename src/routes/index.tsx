import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DemoGraph } from "@/components/landing/demo-graph";
import { Button } from "@/components/ui/button";
import hero from "../../docs/hive.png";

const PROBLEMS = [
  {
    title: "Find the note. Miss the decision.",
    body: "Search returns the meeting note, the doc, and three threads. None of them say what was actually chosen.",
  },
  {
    title: "See the text. Miss the path.",
    body: "The reason lives on the decision, the person who made it, and the project it affects. A chunk of text does not connect them.",
  },
  {
    title: "Read the answer. Miss that it is stale.",
    body: "When a decision changes, the old answer keeps circulating. Nothing tells you which answers relied on it.",
  },
];

const STEPS = [
  {
    title: "Ask",
    body: "A question in plain language. Hive seeds from Relate's full-text index, then expands two hops.",
  },
  {
    title: "Read the receipt",
    body: "The active decision, the person, the project, the note, and the decision it replaced. Every answer carries the exact nodes it used.",
  },
  {
    title: "Review what changed",
    body: "Correct a decision. The old one stays, marked superseded. Every answer that asserted it moves to review.",
  },
];

const SCHEMA = [
  { left: "(:Note)", rel: "STATES", right: "(:Decision)" },
  { left: "(:Decision)", rel: "DECIDED_BY", right: "(:Person)" },
  { left: "(:Decision)", rel: "ABOUT", right: "(:Project)" },
  { left: "(:Decision)", rel: "SUPERSEDES", right: "(:Decision)" },
  { left: "(:Answer)", rel: "USED", right: "(:Note | :Decision | :Person | :Project)" },
  { left: "(:Answer)", rel: "ANSWERED_WITH", right: "(:Decision)" },
];

const AUDIENCE = [
  {
    title: "Product and engineering leads",
    body: "Stop re-litigating decisions. Find the reason, the person, and the note.",
  },
  {
    title: "New teammates",
    body: "Ask why the API looks like this and get the meeting note, not a guess.",
  },
  {
    title: "Teams preparing for a review",
    body: "Show the decision trail, including what was replaced and why.",
  },
];

const QUESTIONS = [
  "Why did we move off Auth0?",
  "What did we decide about pricing?",
  "Why did we leave Vercel?",
];

const SectionNumber = ({ value, dark = false }: { value: string; dark?: boolean }) => (
  <p
    aria-hidden="true"
    className={`font-serif text-6xl leading-none tracking-[-0.04em] sm:text-7xl ${
      dark ? "text-white/10" : "text-foreground/10"
    }`}
  >
    {value}
  </p>
);

const LandingPage = () => (
  <div className="hive min-h-svh bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-[75rem] items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5 text-foreground">
          <img src="/hive.png" alt="" className="size-8" />
          <span className="font-serif text-xl font-semibold tracking-tight">Hive</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#problem" className="transition-colors hover:text-foreground">
            The problem
          </a>
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#why" className="transition-colors hover:text-foreground">
            Why a graph
          </a>
          <a href="#who" className="transition-colors hover:text-foreground">
            Who it is for
          </a>
        </nav>
        <Button size="sm" nativeButton={false} render={<Link to="/hive" reloadDocument />}>
          Open the demo
        </Button>
      </div>
    </header>

    <main>
      <section className="mx-auto grid max-w-[75rem] gap-12 px-5 pb-16 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:pb-24 lg:pt-24">
        <div className="min-w-0">
          <h1 className="font-serif text-[clamp(3rem,5vw,4.2rem)] leading-[0.98] tracking-[-0.035em] text-balance">
            Decisions,
            <span className="block text-primary">with receipts.</span>
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-8 text-muted-foreground text-pretty">
            A local-first decision log for 5–15 person product teams. Ask why a choice was made, see
            the graph behind the answer, and know which answers went stale.
          </p>
          <div className="mt-8">
            <Button size="lg" nativeButton={false} render={<Link to="/hive" reloadDocument />}>
              Open the demo
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
            </Button>
          </div>
          <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Embedded Relate graph, one file, no model
          </p>
        </div>

        <div className="relative min-w-0">
          <div className="overflow-hidden rounded-2xl bg-[oklch(0.235_0.012_60)] p-2 shadow-2xl ring-1 ring-black/10">
            <div className="flex items-center gap-1.5 px-2 pb-2 pt-1">
              <span className="size-2 rounded-full bg-white/20" />
              <span className="size-2 rounded-full bg-white/20" />
              <span className="size-2 rounded-full bg-white/20" />
              <span className="ml-3 rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] text-white/50">
                hive / ask
              </span>
            </div>
            <img
              src={hero}
              alt="Hive answering “Why did we move off Auth0?” with an answer, numbered citations, a context receipt, and a graph of the nodes it used."
              className="aspect-[16/11] w-full rounded-lg object-cover object-top"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-border bg-card px-4 py-3 shadow-lg sm:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              Context receipt
            </p>
            <p className="mt-1 text-sm font-medium">10 nodes, 15 edges</p>
            <p className="text-[11px] text-muted-foreground">1,347 of 1,400 tokens</p>
          </div>
        </div>
      </section>

      <section id="problem" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-[75rem] px-5 py-20 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[8rem_minmax(0,1fr)]">
            <SectionNumber value="01" />
            <div className="min-w-0">
              <h2 className="max-w-[22ch] font-serif text-4xl leading-[1.05] tracking-[-0.025em] text-balance sm:text-5xl">
                The decision is in the notes. The reason is in someone&apos;s head.
              </h2>
              <div className="mt-12 grid gap-8 sm:grid-cols-3">
                {PROBLEMS.map((problem) => (
                  <div key={problem.title} className="border-t border-border pt-4">
                    <h3 className="font-serif text-xl leading-6">{problem.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground text-pretty">
                      {problem.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 border-t border-border bg-card/50">
        <div className="mx-auto max-w-[75rem] px-5 py-20 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[8rem_minmax(0,1fr)]">
            <SectionNumber value="02" />
            <div className="min-w-0">
              <h2 className="max-w-[20ch] font-serif text-4xl leading-[1.05] tracking-[-0.025em] text-balance sm:text-5xl">
                Ask. Read the receipt. Review what changed.
              </h2>

              <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
                <div className="space-y-8">
                  {STEPS.map((step, index) => (
                    <div key={step.title} className="grid grid-cols-[2rem_1fr] gap-3">
                      <span className="pt-0.5 font-mono text-[10px] text-muted-foreground">
                        0{index + 1}
                      </span>
                      <div>
                        <h3 className="font-serif text-xl leading-6">{step.title}</h3>
                        <p className="mt-1.5 max-w-[42ch] text-sm leading-6 text-muted-foreground text-pretty">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      A real context bundle
                    </p>
                    <span className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground sm:inline">
                      click a node
                    </span>
                  </div>
                  <div className="mt-3">
                    <DemoGraph />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="why"
        className="scroll-mt-20 bg-[oklch(0.235_0.012_60)] text-[oklch(0.95_0.01_90)]"
      >
        <div className="mx-auto max-w-[75rem] px-5 py-20 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[8rem_minmax(0,1fr)]">
            <SectionNumber value="03" dark />
            <div className="min-w-0">
              <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
                <div className="min-w-0">
                  <h2 className="max-w-[18ch] font-serif text-4xl leading-[1.05] tracking-[-0.025em] text-balance sm:text-5xl">
                    The answer is not a chunk. It is a path.
                  </h2>
                  <p className="mt-5 max-w-[52ch] text-base leading-7 text-white/65 text-pretty">
                    A vector store can find the notes that mention Auth0. It cannot tell you that
                    Okta replaced Auth0, who made the call, or which answers relied on the old
                    decision. Those are edges.
                  </p>
                  <ul className="mt-8 space-y-4">
                    {[
                      ["Current, not just relevant.", "Follow SUPERSEDES to the newest decision."],
                      ["Provenance, not just citations.", "Every answer stores the nodes it used."],
                      [
                        "Impact, not just search.",
                        "Find the answers that asserted a decision you just changed.",
                      ],
                    ].map(([title, body]) => (
                      <li key={title} className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[oklch(0.68_0.16_35)]" />
                        <p className="text-sm leading-6 text-white/65">
                          <span className="font-medium text-white">{title}</span> {body}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                    the schema
                  </p>
                  <div className="mt-4 min-w-0 overflow-x-auto">
                    <div className="space-y-2 whitespace-nowrap font-mono text-[11px]">
                      {SCHEMA.map((line) => (
                        <div key={`${line.left}-${line.rel}-${line.right}`}>
                          <span className="text-white/40">{line.left}</span>
                          <span className="text-white/25">-[</span>
                          <span className="text-[oklch(0.74_0.14_35)]">:{line.rel}</span>
                          <span className="text-white/25">]-&gt;</span>
                          <span className="text-white/60">{line.right}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-5 text-white/40">
                    Built on{" "}
                    <a
                      href="https://relatedb.ai"
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/70 underline underline-offset-4 hover:text-white"
                    >
                      Relate
                    </a>{" "}
                    — the embedded graph database from Neo4j.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="who" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-[75rem] px-5 py-20 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[8rem_minmax(0,1fr)]">
            <SectionNumber value="04" />
            <div className="min-w-0">
              <h2 className="max-w-[22ch] font-serif text-4xl leading-[1.05] tracking-[-0.025em] text-balance sm:text-5xl">
                A small team that writes decisions down.
              </h2>
              <p className="mt-5 max-w-[60ch] text-base leading-7 text-muted-foreground text-pretty">
                Hive is for the 5–15 person product team that keeps notes and keeps answering the
                same “why?” questions. It is not a wiki, a chatbot, or a compliance system.
              </p>

              <div className="mt-10 divide-y divide-border border-t border-border">
                {AUDIENCE.map((item) => (
                  <div key={item.title} className="grid gap-2 py-5 sm:grid-cols-[14rem_1fr]">
                    <h3 className="font-serif text-xl leading-6">{item.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground text-pretty">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-6 font-mono text-[11px] leading-5 text-muted-foreground">
                Today: add-only, one store, one writer, no bulk import.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="try" className="scroll-mt-20 border-t border-border bg-card/50">
        <div className="mx-auto max-w-[75rem] px-5 py-20 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[8rem_minmax(0,1fr)]">
            <SectionNumber value="05" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="min-w-0">
                  <h2 className="font-serif text-4xl leading-[1.05] tracking-[-0.025em] text-balance sm:text-5xl">
                    Ask the ledger.
                  </h2>
                  <p className="mt-3 max-w-[56ch] text-base leading-7 text-muted-foreground text-pretty">
                    The demo is seeded with a fictional 18-note company. No signup. It runs locally
                    on one file.
                  </p>
                </div>
                <Button size="lg" nativeButton={false} render={<Link to="/hive" reloadDocument />}>
                  Open the demo
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
                </Button>
              </div>

              <div className="mt-10 divide-y divide-border border-t border-border">
                {QUESTIONS.map((question, index) => (
                  <div key={question} className="flex items-baseline gap-4 py-5">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      0{index + 1}
                    </span>
                    <span className="font-serif text-xl leading-6 sm:text-2xl">{question}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">
                These are the suggested questions inside the demo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer className="bg-[oklch(0.235_0.012_60)] text-white/60">
      <div className="mx-auto max-w-[75rem] px-5 py-14">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 text-white">
              <img src="/hive.png" alt="" className="size-8" />
              <span className="font-serif text-2xl font-semibold tracking-tight">Hive</span>
            </div>
            <p className="mt-3 max-w-[30ch] text-sm leading-6 text-white/50">
              Decision memory for small product teams.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link to="/hive" reloadDocument />}
              className="bg-[oklch(0.54_0.16_35)] text-white hover:bg-[oklch(0.58_0.16_35)]"
            >
              Open the demo
            </Button>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/50">
              <a href="#how" className="transition-colors hover:text-white">
                How it works
              </a>
              <a href="#why" className="transition-colors hover:text-white">
                Why a graph
              </a>
              <a
                href="https://relatedb.ai"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                Relate ↗
              </a>
              <a
                href="https://relate.devpost.com/"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                Hackathon ↗
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-white/35">
          <p>Built for the Relate by Neo4j Hackathon. Seed data is synthetic.</p>
          <p>MIT license. Relate 1.0.1.</p>
        </div>

        <p className="mt-8 select-none font-serif text-[clamp(4rem,14vw,10rem)] leading-none tracking-[-0.04em] text-white/[0.04]">
          Hive
        </p>
      </div>
    </footer>
  </div>
);

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Hive — decision memory for small product teams" },
      {
        name: "description",
        content:
          "A local-first decision log. Ask why a choice was made, see the graph behind the answer, and know which answers went stale when the decision changed.",
      },
      { property: "og:title", content: "Hive — decision memory for small product teams" },
      {
        property: "og:description",
        content:
          "Answers with receipts. A local-first decision log built on Relate, the embedded graph database.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});
