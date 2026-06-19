"use client";

import { useState } from "react";
import { AlertCircle, Send, ShieldCheck, Users } from "lucide-react";
import { FormField } from "@/components/campaigns/setup/FormField";
import { SuppressionListUpload } from "@/components/campaigns/setup/SuppressionListUpload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  estimateAudienceReach,
  summarizeAudienceFilters,
} from "@/lib/audience-filters";
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

  const audienceSummary = summarizeAudienceFilters(draft.audienceFilters);
  const audienceReach = estimateAudienceReach(draft.audienceFilters);

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
        <div className="flex items-start gap-2">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
          <div>
            <h3 className="text-sm font-semibold">Audience targeting</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {audienceSummary.length === 0
                ? "All customers — no audience filters applied."
                : "Customers must match every filter below."}
            </p>
          </div>
        </div>

        {audienceSummary.length > 0 ? (
          <ul className="space-y-1 pl-6 text-sm text-muted-foreground">
            {audienceSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}

        <p className="pl-6 text-sm">
          Estimated reach:{" "}
          <span className="font-medium text-foreground">
            ~{audienceReach.toLocaleString("en-US")} vehicles
          </span>
        </p>
      </section>

      <section className="space-y-4 rounded-md border border-border p-4">
        <div>
          <h3 className="text-sm font-semibold">Audience suppression</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Exclude opted-out customers and numbers on your do-not-contact list
            before launch.
          </p>
        </div>

        <SuppressionListUpload
          fileName={draft.suppressionListFileName}
          entryCount={draft.suppressionListEntryCount}
          error={errors.suppressionListFileName}
          onChange={(fileName, entryCount) =>
            onChange({
              suppressionListFileName: fileName,
              suppressionListEntryCount: entryCount,
            })
          }
        />
      </section>

      <section className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
          <div>
            <h3 className="text-sm font-semibold">TCPA compliance</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Federal TCPA rules require consent for marketing texts and timely
              honoring of opt-out requests (including STOP replies).
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm">
          <Checkbox
            id="tcpaComplianceConfirmed"
            checked={draft.tcpaComplianceConfirmed}
            onChange={(event) =>
              onChange({ tcpaComplianceConfirmed: event.target.checked })
            }
            className="mt-0.5"
            aria-invalid={Boolean(errors.tcpaComplianceConfirmed)}
          />
          <span>
            <Label
              htmlFor="tcpaComplianceConfirmed"
              className="cursor-pointer font-medium text-foreground"
            >
              I confirm TCPA compliance for this campaign
            </Label>
            <span className="mt-1 block text-muted-foreground">
              I have excluded opted-out and suppressed phone numbers from this
              audience, verified consent where required, and will honor STOP and
              other opt-out requests in compliance with TCPA guidelines.
            </span>
          </span>
        </label>

        {errors.tcpaComplianceConfirmed ? (
          <p className="text-sm text-destructive">{errors.tcpaComplianceConfirmed}</p>
        ) : null}
      </section>

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
          disabled={isActivating || !draft.tcpaComplianceConfirmed}
        >
          {isActivating ? "Activating…" : "Activate campaign"}
        </Button>
        {!draft.tcpaComplianceConfirmed ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Confirm TCPA compliance above to enable activation.
          </p>
        ) : null}
      </div>
    </div>
  );
}
