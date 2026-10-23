"use client";

import {
  Button,
  Input,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Send, Users } from "lucide-react";
import { AudienceReachCard } from "@/components/campaigns/setup/AudienceReachCard";
import { FormField } from "@/components/campaigns/setup/FormField";
import { SECTION_CARD_CLASS } from "@/components/campaigns/setup/OptionCard";
import { SuppressionListUpload } from "@/components/campaigns/setup/SuppressionListUpload";
import { useProductVersion } from "@/contexts/product-version-context";
import { summarizeAudienceFilters } from "@/lib/audience-filters";
import { cn } from "@/lib/utils";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

interface ReviewStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
  onTestSend: () => void;
  isTestSent: boolean;
}

export function ReviewStep({
  draft,
  errors,
  onChange,
  onTestSend,
  isTestSent,
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

  return (
    <div className="space-y-6">
      <section className={cn(SECTION_CARD_CLASS, "space-y-4")}>
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Audience Summary
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Estimated customers for this campaign after your trigger and
            audience filters.
          </p>
        </div>

        <AudienceReachCard
          rules={draft.audienceFilters}
          label="Customers Targeted"
          unit="customers"
          showFilterSummary={false}
          icon={Users}
          className="w-fit"
        />

        {audienceSummary.length > 0 ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {audienceSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {!isMvpV10Version ? (
        <section className={cn(SECTION_CARD_CLASS, "space-y-4")}>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Audience Suppression
            </h3>
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
        <p className="flex items-start gap-2 text-sm text-[var(--status-active-fg)]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Test message queued. Confirm variables and image on your device before
          activating.
        </p>
      )}

      {!isTestSent && testStatus !== "sent" ? (
        <p className="flex items-start gap-2 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Send a test before activating to meet SOP requirements.
        </p>
      ) : null}
    </div>
  );
}
