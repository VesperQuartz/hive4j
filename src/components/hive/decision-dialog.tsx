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
import type { CreateDecisionResponse, LibraryNote, PersonRef, ProjectRef } from "@/lib/hive/types";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

const DecisionForm = ({
  people,
  projects,
  notes,
  onCreated,
  onClose,
}: {
  people: PersonRef[];
  projects: ProjectRef[];
  notes: LibraryNote[];
  onCreated: (decisionId: string) => void;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [reason, setReason] = useState("");
  const [personId, setPersonId] = useState(people[0]?.id ?? "");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [noteId, setNoteId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectivePersonId = personId || people[0]?.id || "";
  const effectiveProjectId = projectId || projects[0]?.id || "";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await postJson<CreateDecisionResponse>("/api/hive/decisions", {
        text,
        reason,
        personId: effectivePersonId,
        projectId: effectiveProjectId,
        noteId: noteId || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["hive", "library"] });
      await queryClient.invalidateQueries({ queryKey: ["hive", "overview"] });
      toast.success("Decision added.");
      onCreated(result.decisionId);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The decision could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const blocked = people.length === 0 || projects.length === 0;

  return (
    <form onSubmit={submit} className="space-y-4">
      {blocked ? (
        <p className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs text-foreground">
          Add a person and a project first, on the Notes page.
        </p>
      ) : null}

      <div>
        <label htmlFor="decision-text" className="text-[11px] font-medium text-muted-foreground">
          Decision
        </label>
        <Textarea
          id="decision-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Move from Auth0 to Okta for enterprise SSO."
          className="mt-1 min-h-20 bg-card"
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="decision-reason" className="text-[11px] font-medium text-muted-foreground">
          Why
        </label>
        <Input
          id="decision-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Three enterprise deals need SAML SSO and SCIM."
          className="mt-1 bg-card"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="decision-person"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Decided by
          </label>
          <select
            id="decision-person"
            value={effectivePersonId}
            onChange={(event) => setPersonId(event.target.value)}
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
          <label
            htmlFor="decision-project"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Project
          </label>
          <select
            id="decision-project"
            value={effectiveProjectId}
            onChange={(event) => setProjectId(event.target.value)}
            className={`mt-1 ${selectClass}`}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="decision-note" className="text-[11px] font-medium text-muted-foreground">
          Source note
        </label>
        <select
          id="decision-note"
          value={noteId}
          onChange={(event) => setNoteId(event.target.value)}
          className={`mt-1 ${selectClass}`}
        >
          <option value="">Create a decision log note</option>
          {notes.map((note) => (
            <option key={note.id} value={note.id}>
              {note.title}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-muted-foreground">
          A decision needs a source. Without one, Hive creates a small decision-log note.
        </p>
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
          {saving ? "Saving…" : "Add decision"}
        </Button>
      </div>
    </form>
  );
};

export const DecisionDialog = ({
  open,
  onOpenChange,
  people,
  projects,
  notes,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: PersonRef[];
  projects: ProjectRef[];
  notes: LibraryNote[];
  onCreated: (decisionId: string) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="hive sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-serif text-xl">New decision</DialogTitle>
        <DialogDescription>
          A decision is the thing Hive answers from. It links to a person, a project, and a source
          note.
        </DialogDescription>
      </DialogHeader>
      <DecisionForm
        people={people}
        projects={projects}
        notes={notes}
        onCreated={onCreated}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
);
