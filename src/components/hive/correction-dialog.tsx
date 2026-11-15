import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CorrectionForm } from "@/components/hive/correction-form";
import { postJson } from "@/lib/hive/client";
import type { LibraryDecision } from "@/lib/hive/types";

export const CorrectionDialog = ({
  open,
  onOpenChange,
  decision,
  onCorrected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: LibraryDecision | null;
  onCorrected: () => void;
}) => {
  const queryClient = useQueryClient();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="hive sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Correct decision</DialogTitle>
          <DialogDescription>
            The old decision stays in the graph, marked superseded. Answers that asserted it move to
            review.
          </DialogDescription>
        </DialogHeader>
        {decision ? (
          <div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Current decision
              </p>
              <p className="mt-1 font-serif text-sm font-semibold leading-5">{decision.text}</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{decision.reason}</p>
            </div>
            <CorrectionForm
              key={decision.id}
              decision={{ id: decision.id, text: decision.text, reason: decision.reason }}
              onSubmit={async (input) => {
                await postJson("/api/hive/correct", input);
                await queryClient.invalidateQueries({ queryKey: ["hive", "library"] });
                await queryClient.invalidateQueries({ queryKey: ["hive", "overview"] });
                toast.success("Correction saved. The old decision is superseded.");
                onCorrected();
                onOpenChange(false);
              }}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
