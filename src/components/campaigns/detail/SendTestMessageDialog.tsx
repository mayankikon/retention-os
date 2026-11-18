"use client";

import {
  Button,
  Input,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { AlertCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { FormField } from "@/components/campaigns/setup/FormField";
import { AppDialogShell } from "@/components/layout/AppDialogShell";
import { APP_DIALOG_INSTRUCTION_CLASS } from "@/lib/app-dialog-shell";
import {
  isValidTestPhone,
  sendTestMessage,
  TEST_PHONE_INVALID_ERROR,
  testSendCopy,
} from "@/lib/test-message";

interface SendTestMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPhone?: string;
  onSent: (phone: string) => void;
}

type SendStatus = "idle" | "sending" | "failed";

export function SendTestMessageDialog({
  open,
  onOpenChange,
  defaultPhone = "",
  onSent,
}: SendTestMessageDialogProps) {
  const [phone, setPhone] = useState(defaultPhone);
  const [status, setStatus] = useState<SendStatus>("idle");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const isSending = status === "sending";

  const handleOpenChange = (next: boolean) => {
    // The send is in flight; keep the dialog until it resolves.
    if (isSending) return;
    if (!next) {
      setStatus("idle");
      setFieldError(undefined);
    }
    onOpenChange(next);
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (isSending) return;
    if (!isValidTestPhone(phone)) {
      setFieldError(TEST_PHONE_INVALID_ERROR);
      return;
    }
    setFieldError(undefined);
    setStatus("sending");
    const result = await sendTestMessage(phone);
    if (!result.ok) {
      setStatus("failed");
      return;
    }
    setStatus("idle");
    onSent(phone);
    onOpenChange(false);
  };

  return (
    <AppDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      title={testSendCopy.dialogTitle}
      size="compact"
      showCloseButton={!isSending}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => handleOpenChange(false)}
            disabled={isSending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="send-test-message-form"
            size="lg"
            disabled={!phone.trim()}
            loading={isSending}
            leadingIcon={<Send aria-hidden />}
            className="cursor-pointer"
          >
            {isSending ? "Sending…" : "Send Test"}
          </Button>
        </>
      }
    >
      <form
        id="send-test-message-form"
        className="space-y-4"
        onSubmit={handleSubmit}
        noValidate
      >
        <p className={APP_DIALOG_INSTRUCTION_CLASS}>
          {testSendCopy.dialogDescription}
        </p>

        <FormField
          label="Test Mobile Number"
          htmlFor="detail-test-phone"
          error={fieldError}
        >
          <Input
            id="detail-test-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setFieldError(undefined);
              if (status === "failed") setStatus("idle");
            }}
            placeholder="+1 (555) 000-0000"
            disabled={isSending}
            aria-invalid={Boolean(fieldError)}
          />
        </FormField>

        {status === "failed" ? (
          <p
            className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {testSendCopy.dialogFailure}
          </p>
        ) : null}
      </form>
    </AppDialogShell>
  );
}
