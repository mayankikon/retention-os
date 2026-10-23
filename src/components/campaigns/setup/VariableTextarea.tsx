"use client";

import {
  Button,
  Textarea,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { useRef, useState } from "react";
import { Braces } from "lucide-react";
import { AddMessageVariableDialog } from "@/components/campaigns/setup/AddMessageVariableDialog";
import { insertTextAtCursor } from "@/lib/insert-text-at-cursor";

interface VariableTextareaProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  rows: number;
  invalid: boolean;
}

/** Message textarea with an "Add variables" button that inserts tokens at the cursor. */
export function VariableTextarea({
  id,
  value,
  onValueChange,
  rows,
  invalid,
}: VariableTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState(false);

  const handleInsertVariable = (token: string) => {
    const textarea = textareaRef.current;
    const selectionStart = textarea?.selectionStart ?? value.length;
    const selectionEnd = textarea?.selectionEnd ?? selectionStart;

    const { value: nextValue, cursorPosition } = insertTextAtCursor(
      value,
      selectionStart,
      selectionEnd,
      token,
    );

    onValueChange(nextValue);

    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        rows={rows}
        aria-invalid={invalid}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setIsVariableDialogOpen(true)}
      >
        <Braces className="mr-2 h-4 w-4" />
        Add variables
      </Button>
      <AddMessageVariableDialog
        open={isVariableDialogOpen}
        onOpenChange={setIsVariableDialogOpen}
        onSelectVariable={handleInsertVariable}
      />
    </div>
  );
}
