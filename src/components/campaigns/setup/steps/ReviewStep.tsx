"use client";

import { useState } from "react";
import { AlertCircle, Send } from "lucide-react";
import { FormField } from "@/components/campaigns/setup/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

interface ReviewStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
  onTestSend: () => void;
  onActivate: () => void;
  isTestSent: boolean;
  isActivating: boolean;
}

export function ReviewStep({
  draft,
  errors,
  onChange,
  onTestSend,
  onActivate,
  isTestSent,
  isActivating,
}: ReviewStepProps) {
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );

  const handleTestSend = async () => {
    setTestStatus("sending");
    await new Promise((resolve) => setTimeout(resolve, 800));
    setTestStatus("sent");
    onTestSend();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border p-4">
        <h3 className="text-sm font-semibold">Quality assurance</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Send a campaign test to your mobile device.</li>
          <li>
            Verify variables (name, vehicle, [@DSP@]) and the campaign image.
          </li>
          <li>Activate to launch the campaign.</li>
        </ol>
      </section>

      <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4 text-sm">
        <h4 className="font-medium">Configuration checklist</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>Name: {draft.campaignName || "—"}</li>
          <li>Image: {draft.campaignImageFileName ?? "Missing"}</li>
          <li>Dealer DID in reminders: {draft.dealerDid || "Missing"}</li>
          <li>
            Subfleets:{" "}
            {draft.subfleets.length > 0
              ? draft.subfleets.join(", ")
              : "None selected"}
          </li>
        </ul>
      </div>

      <FormField
        label="Test mobile number"
        htmlFor="testPhone"
        hint="Send Campaign Test — sample SMS to your device."
        error={errors.testPhoneNumber}
      >
        <div className="flex gap-2">
          <Input
            id="testPhone"
            type="tel"
            value={draft.testPhoneNumber}
            onChange={(e) => onChange({ testPhoneNumber: e.target.value })}
            placeholder="+1 (555) 000-0000"
            hasError={Boolean(errors.testPhoneNumber)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleTestSend}
            disabled={testStatus === "sending" || !draft.testPhoneNumber.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            {testStatus === "sending"
              ? "Sending…"
              : testStatus === "sent" || isTestSent
                ? "Sent"
                : "Send test"}
          </Button>
        </div>
      </FormField>

      {(isTestSent || testStatus === "sent") && (
        <p className="text-sm text-[var(--status-active-fg)]">
          Test message queued. Confirm variables and image on your device before
          activating.
        </p>
      )}

      {!isTestSent && testStatus !== "sent" ? (
        <p className="flex items-start gap-2 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Send a test before activating to meet SOP requirements.
        </p>
      ) : null}

      <div className="border-t border-border pt-6">
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={onActivate}
          disabled={isActivating}
        >
          {isActivating ? "Activating…" : "Activate campaign"}
        </Button>
      </div>
    </div>
  );
}
