import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postJson } from "@/lib/hive/client";
import type { CreateEntityResponse, PersonRef, ProjectRef } from "@/lib/hive/types";

const AddForm = ({
  kind,
  label,
  placeholder,
}: {
  kind: "person" | "project";
  label: string;
  placeholder: string;
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2 || saving) return;
    setSaving(true);
    try {
      await postJson<CreateEntityResponse>("/api/hive/library", { kind, name });
      await queryClient.invalidateQueries({ queryKey: ["hive", "library"] });
      await queryClient.invalidateQueries({ queryKey: ["hive", "overview"] });
      toast.success(`${label} added.`);
      setName("");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "That could not be added.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <label htmlFor={`add-${kind}`} className="sr-only">
        {label}
      </label>
      <Input
        id={`add-${kind}`}
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={placeholder}
        className="h-8 bg-card"
      />
      <Button type="submit" size="sm" variant="outline" disabled={saving || name.trim().length < 2}>
        Add
      </Button>
    </form>
  );
};

export const LibraryForms = ({
  people,
  projects,
}: {
  people: PersonRef[];
  projects: ProjectRef[];
}) => (
  <div className="space-y-5">
    <div>
      <h3 className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        People
      </h3>
      <div className="mt-2 flex flex-wrap gap-1">
        {people.map((person) => (
          <span
            key={person.id}
            className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {person.name}
          </span>
        ))}
      </div>
      <div className="mt-2">
        <AddForm kind="person" label="Person" placeholder="Add a person" />
      </div>
    </div>

    <div>
      <h3 className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Projects
      </h3>
      <div className="mt-2 flex flex-wrap gap-1">
        {projects.map((project) => (
          <span
            key={project.id}
            className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {project.name}
          </span>
        ))}
      </div>
      <div className="mt-2">
        <AddForm kind="project" label="Project" placeholder="Add a project" />
      </div>
    </div>
  </div>
);
