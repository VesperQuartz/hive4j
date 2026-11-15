import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type CorrectionInput = {
  decisionId: string;
  text: string;
  reason: string;
};

export const CorrectionForm = ({
  decision,
  onSubmit,
  onCancel,
}: {
  decision: { id: string; text: string; reason: string };
  onSubmit: (input: CorrectionInput) => Promise<void>;
  onCancel: () => void;
}) => {
  const [text, setText] = useState(decision.text);
  const [reason, setReason] = useState(decision.reason);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ decisionId: decision.id, text, reason });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The correction could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <div>
        <label
          htmlFor="hive-decision-text"
          className="text-[11px] font-medium text-muted-foreground"
        >
          New decision
        </label>
        <Textarea
          id="hive-decision-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="mt-1 min-h-20 bg-card"
        />
      </div>
      <div>
        <label
          htmlFor="hive-decision-reason"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Why
        </label>
        <Input
          id="hive-decision-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-1 bg-card"
        />
      </div>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : "Save correction"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <p className="text-[11px] leading-5 text-muted-foreground">
        The old decision stays in the graph, marked superseded. Answers that asserted it move to
        review.
      </p>
    </form>
  );
};
