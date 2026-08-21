"use client";

import {
  Button,
  Input,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { useState } from "react";
import { AlertCircle, Send, Users } from "lucide-react";
import { FormField } from "@/components/campaigns/setup/FormField";
import { SuppressionListUpload } from "@/components/campaigns/setup/SuppressionListUpload";
import { useProductVersion } from "@/contexts/product-version-context";
import {
  estimateAudienceReach,
  summarizeAudienceFilters,
} from "@/lib/audience-filters";
import { isFutureCampaignStartDate } from "@/lib/campaign-window";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

interface ReviewStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
  onTestSend: () => void;
  onActivateNow: () => void;
  onSaveDraft: () => void;
  isTestSent: boolean;
  isActivating: boolean;
}

export function ReviewStep({
  draft,
  errors,
  onChange,
  onTestSend,
  onActivateNow,
  onSaveDraft,
  isTestSent,
  isActivating,
}: ReviewStepProps) {
  const { versionId } = useProductVersion();
  const isMvpV10Version = versionId === "mvp_v1_0";
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
  const customersTargeted = estimateAudienceReach(draft.audienceFilters);
  const canLaunch = !isActivating;
  const isScheduledStart = isFutureCampaignStartDate(draft.campaignStartDate);
  const launchLabel = isScheduledStart ? "Schedule" : "Activate";
  const launchingLabel = isScheduledStart ? "Scheduling…" : "Activating…";

  return (
    <div className="space-y-6">
      <section className="surface-stroke-sharp rounded-[var(--radius-sm)] bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
            <Users className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">
              Audience Summary
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Estimated customers for this campaign after your trigger and
              audience filters.
            </p>

            <div className="mt-4 max-w-xs rounded-md border border-border bg-muted/20 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Customers Targeted
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                ~{customersTargeted.toLocaleString("en-US")}
              </p>
            </div>

            {audienceSummary.length > 0 ? (
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                {audienceSummary.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No audience filters applied — using the full dealership pool for
                this trigger.
              </p>
            )}
          </div>
        </div>
      </section>

      {!isMvpV10Version ? (
        <section className="space-y-4 rounded-md border border-border p-4">
          <div>
            <h3 className="text-sm font-semibold">Audience Suppression</h3>
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
      ) : null}

      <FormField
        label="Test Mobile Number"
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
            aria-invalid={Boolean(errors.testPhoneNumber)}
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
                : "Send Test"}
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

      <div className="space-y-4 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          Timing comes from the start date, optional end date, and send time set
          in Configuration. Activate is shown when the start date is today;
          Schedule is shown when it is later. Either action moves the campaign
          to Active; a future start date waits until that date before eligible
          sends begin.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            onClick={onActivateNow}
            disabled={!canLaunch}
          >
            {isActivating ? launchingLabel : launchLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isActivating}
          >
            Save Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
