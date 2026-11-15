import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { postJson } from "@/lib/hive/client";
import type { CreateNoteResponse, PersonRef, ProjectRef } from "@/lib/hive/types";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

const NoteForm = ({
  people,
  projects,
  onCreated,
  onClose,
}: {
  people: PersonRef[];
  projects: ProjectRef[];
  onCreated: (noteId: string) => void;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorId, setAuthorId] = useState(people[0]?.id ?? "");
  const [projectIds, setProjectIds] = useState<string[]>(projects[0] ? [projects[0].id] : []);
  const [recordsDecision, setRecordsDecision] = useState(false);
  const [decisionText, setDecisionText] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAuthorId = authorId || people[0]?.id || "";
  const effectiveProjectIds =
    projectIds.length > 0 ? projectIds : projects[0] ? [projects[0].id] : [];

  const toggleProject = (id: string) => {
    setProjectIds((current) => {
      const base = current.length > 0 ? current : effectiveProjectIds;
      return base.includes(id) ? base.filter((value) => value !== id) : [...base, id];
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await postJson<CreateNoteResponse>("/api/hive/notes", {
        title,
        body,
        authorId: effectiveAuthorId,
        projectIds: effectiveProjectIds,
        decision: recordsDecision ? { text: decisionText, reason: decisionReason } : undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["hive", "library"] });
      await queryClient.invalidateQueries({ queryKey: ["hive", "overview"] });
      toast.success(recordsDecision ? "Note and decision added." : "Note added.");
      onCreated(result.noteId);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The note could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const blocked = people.length === 0 || projects.length === 0;

  return (
    <form onSubmit={submit} className="space-y-4">
      {blocked ? (
        <p className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs text-foreground">
          Add a person and a project first, in the panel beside the notes.
        </p>
      ) : null}

      <div>
        <label htmlFor="note-title" className="text-[11px] font-medium text-muted-foreground">
          Title
        </label>
        <Input
          id="note-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Architecture sync — identity provider"
          className="mt-1 bg-card"
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="note-body" className="text-[11px] font-medium text-muted-foreground">
          Note
        </label>
        <Textarea
          id="note-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What happened, who was there, and what was decided."
          className="mt-1 min-h-32 bg-card"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="note-author" className="text-[11px] font-medium text-muted-foreground">
            Author
          </label>
          <select
            id="note-author"
            value={effectiveAuthorId}
            onChange={(event) => setAuthorId(event.target.value)}
            className={`mt-1 ${selectClass}`}
          >
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="text-[11px] font-medium text-muted-foreground">Projects</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {projects.map((project) => {
              const checked = effectiveProjectIds.includes(project.id);
              return (
                <label
                  key={project.id}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    checked
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleProject(project.id)}
                    className="sr-only"
                  />
                  {project.name}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-3">
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={recordsDecision}
            onChange={(event) => setRecordsDecision(event.target.checked)}
            className="mt-0.5 size-4 accent-[var(--primary)]"
          />
          <span>
            <span className="block text-sm font-medium">This note records a decision</span>
            <span className="block text-[11px] text-muted-foreground">
              It becomes a Decision node, linked to the note, author, and projects.
            </span>
          </span>
        </label>

        {recordsDecision ? (
          <div className="mt-3 space-y-2">
            <div>
              <label
                htmlFor="note-decision-text"
                className="text-[11px] font-medium text-muted-foreground"
              >
                Decision
              </label>
              <Textarea
                id="note-decision-text"
                value={decisionText}
                onChange={(event) => setDecisionText(event.target.value)}
                placeholder="Move from Auth0 to Okta for enterprise SSO."
                className="mt-1 min-h-16 bg-card"
              />
            </div>
            <div>
              <label
                htmlFor="note-decision-reason"
                className="text-[11px] font-medium text-muted-foreground"
              >
                Why
              </label>
              <Input
                id="note-decision-reason"
                value={decisionReason}
                onChange={(event) => setDecisionReason(event.target.value)}
                placeholder="Three enterprise deals need SAML SSO."
                className="mt-1 bg-card"
              />
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || blocked}>
          {saving ? "Saving…" : "Add note"}
        </Button>
      </div>
    </form>
  );
};

export const NoteDialog = ({
  open,
  onOpenChange,
  people,
  projects,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: PersonRef[];
  projects: ProjectRef[];
  onCreated: (noteId: string) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="hive sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-serif text-xl">New note</DialogTitle>
        <DialogDescription>
          A note is the source. If it records a decision, Hive links the decision to the note, the
          author, and the projects.
        </DialogDescription>
      </DialogHeader>
      <NoteForm
        people={people}
        projects={projects}
        onCreated={onCreated}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
);
