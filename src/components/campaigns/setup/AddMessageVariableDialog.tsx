"use client";

import { MESSAGE_VARIABLES } from "@/data/message-variables";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddMessageVariableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVariable: (token: string) => void;
}

export function AddMessageVariableDialog({
  open,
  onOpenChange,
  onSelectVariable,
}: AddMessageVariableDialogProps) {
  const handleSelect = (token: string) => {
    onSelectVariable(token);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert message variable</DialogTitle>
          <DialogDescription>
            Choose a variable to insert at your cursor. Each token is replaced
            with customer or dealer data when the message is sent.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {MESSAGE_VARIABLES.map((variable) => (
            <li key={variable.token}>
              <button
                type="button"
                onClick={() => handleSelect(variable.token)}
                className="w-full rounded-md border border-border bg-background p-3 text-left transition-colors hover:border-brand-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-brand-primary">
                    {variable.token}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {variable.label}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {variable.description}
                </p>
                <p className="mt-1 text-xs text-foreground/80">
                  Example:{" "}
                  <span className="font-medium">{variable.example}</span>
                </p>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
