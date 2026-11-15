import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { NoteDialog } from "@/components/hive/note-dialog";
import { LibraryForms } from "@/components/hive/library-forms";
import { PageHeader } from "@/components/hive/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { libraryQuery } from "@/lib/hive/client";
import { cn } from "@/lib/utils";

const NotesPage = () => {
  const library = useQuery(libraryQuery);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  const notes = useMemo(() => library.data?.notes ?? [], [library.data?.notes]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return notes;
    return notes.filter((note) =>
      [
        note.title,
        note.body,
        note.author?.name ?? "",
        ...note.projects.map((project) => project.name),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [notes, search]);

  return (
    <>
      <PageHeader
        kicker="Source notes"
        title="Notes"
        description="The source of truth. Each note can record a decision; the graph links it to the author, the projects, and the decision it states."
        action={<Button onClick={() => setDialogOpen(true)}>New note</Button>}
      />

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles, bodies, people, projects"
              className="h-9 bg-card"
              aria-label="Search notes"
            />
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {filtered.length} of {notes.length}
            </span>
          </div>

          {library.isLoading ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((key) => (
                <div
                  key={key}
                  className="h-28 animate-pulse rounded-xl border border-border bg-card"
                />
              ))}
            </div>
          ) : null}

          {library.error ? (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {library.error instanceof Error
                ? library.error.message
                : "The notes could not be read."}
            </p>
          ) : null}

          {!library.isLoading && filtered.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <p className="font-serif text-lg font-semibold">
                {notes.length === 0 ? "No notes yet" : "No notes match that search"}
              </p>
              <p className="mx-auto mt-1 max-w-[40ch] text-sm text-muted-foreground">
                {notes.length === 0
                  ? "Add the first note. If it records a decision, Hive creates the decision and its edges in the same step."
                  : "Try a person, a project, or a word from the body."}
              </p>
              {notes.length === 0 ? (
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  New note
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {filtered.map((note) => {
              const open = openNoteId === note.id;
              return (
                <article
                  key={note.id}
                  className={cn(
                    "rounded-xl border bg-card p-4 transition-colors",
                    open ? "border-primary/40" : "border-border hover:border-border/80",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {note.date}
                      </p>
                      <h3 className="mt-1 font-serif text-lg font-semibold leading-6">
                        {note.title}
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenNoteId(open ? null : note.id)}
                      aria-expanded={open}
                    >
                      {open ? "Close" : "Read"}
                    </Button>
                  </div>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {note.author?.name ?? "Unknown author"}
                    {note.projects.length > 0
                      ? ` · ${note.projects.map((project) => project.name).join(", ")}`
                      : ""}
                  </p>

                  <p
                    className={cn(
                      "mt-2 whitespace-pre-line text-sm leading-6 text-foreground/85",
                      !open && "line-clamp-2",
                    )}
                  >
                    {note.body}
                  </p>

                  {note.decisions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-2">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Records
                      </span>
                      {note.decisions.map((decision) => (
                        <Badge
                          key={decision.id}
                          variant={decision.status === "active" ? "secondary" : "outline"}
                          className="max-w-full"
                        >
                          <span className="truncate">{decision.text}</span>
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <Card className="gap-0 border-border/80 shadow-none">
            <CardContent>
              <h2 className="font-serif text-lg font-semibold">Add to the graph</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                People and projects give decisions their edges. Add one before writing the next
                note.
              </p>
              <div className="mt-4">
                <LibraryForms
                  people={library.data?.people ?? []}
                  projects={library.data?.projects ?? []}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 border-border/80 shadow-none">
            <CardContent>
              <h2 className="font-serif text-lg font-semibold">How it connects</h2>
              <ol className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Note → Decision.</span> A note
                  states a decision with a reason.
                </li>
                <li>
                  <span className="font-medium text-foreground">Decision → Person, Project.</span>{" "}
                  The decision keeps who made it and what it affects.
                </li>
                <li>
                  <span className="font-medium text-foreground">Decision → Decision.</span> A
                  correction adds a <span className="font-mono text-[10px]">SUPERSEDES</span> edge;
                  the old one stays.
                </li>
              </ol>
            </CardContent>
          </Card>
        </aside>
      </div>

      <NoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        people={library.data?.people ?? []}
        projects={library.data?.projects ?? []}
        onCreated={(noteId) => {
          setOpenNoteId(noteId);
          setSearch("");
        }}
      />
    </>
  );
};

export const Route = createFileRoute("/(dashboard)/hive/notes")({
  component: NotesPage,
  head: () => ({ meta: [{ title: "Notes — Hive" }] }),
});
