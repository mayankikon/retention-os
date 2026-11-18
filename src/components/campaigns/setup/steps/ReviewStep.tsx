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
import {
  isValidTestPhone,
  normalizeTestPhone,
  sendTestMessage,
  TEST_PHONE_INVALID_ERROR,
  testSendCopy,
} from "@/lib/test-message";
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
  const [testStatus, setTestStatus] = useState<
    "idle" | "sending" | "failed"
  >("idle");
  const [testPhoneError, setTestPhoneError] = useState<string | undefined>();
  // The number the last successful test went to. Seeded from the wizard so
  // the confirmation survives leaving and returning to Review.
  const [sentPhone, setSentPhone] = useState<string | null>(
    isTestSent && draft.testPhoneNumber.trim() ? draft.testPhoneNumber : null,
  );
  const isSending = testStatus === "sending";
  const hasSentToCurrentNumber =
    sentPhone !== null &&
    normalizeTestPhone(sentPhone) === normalizeTestPhone(draft.testPhoneNumber);

  const handleTestSend = async () => {
    if (!isValidTestPhone(draft.testPhoneNumber)) {
      setTestPhoneError(TEST_PHONE_INVALID_ERROR);
      return;
    }
    setTestPhoneError(undefined);
    setTestStatus("sending");
    const result = await sendTestMessage(draft.testPhoneNumber);
    if (!result.ok) {
      setTestStatus("failed");
      return;
    }
    setTestStatus("idle");
    setSentPhone(draft.testPhoneNumber);
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
        error={testPhoneError ?? errors.testPhoneNumber}
      >
        <div className="flex gap-2">
          <Input
            id="testPhone"
            type="tel"
            autoComplete="tel"
            value={draft.testPhoneNumber}
            onChange={(e) => {
              onChange({ testPhoneNumber: e.target.value });
              setTestPhoneError(undefined);
              if (testStatus === "failed") setTestStatus("idle");
            }}
            placeholder="+1 (555) 000-0000"
            disabled={isSending}
            aria-invalid={Boolean(testPhoneError ?? errors.testPhoneNumber)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleTestSend}
            disabled={!draft.testPhoneNumber.trim()}
            loading={isSending}
            leadingIcon={<Send aria-hidden />}
          >
            {isSending
              ? "Sending…"
              : hasSentToCurrentNumber
                ? "Send again"
                : "Send Test"}
          </Button>
        </div>
      </FormField>

      <div aria-live="polite">
        {testStatus === "failed" ? (
          <p
            className="flex items-start gap-2 text-sm text-red-700"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {testSendCopy.reviewFailure(draft.testPhoneNumber)}
          </p>
        ) : hasSentToCurrentNumber && !isSending ? (
          <p className="flex items-start gap-2 text-sm text-[var(--status-active-fg)]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {testSendCopy.reviewSuccess(sentPhone)}
          </p>
        ) : !isSending ? (
          <p className="flex items-start gap-2 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {testSendCopy.reviewReminder}
          </p>
        ) : null}
      </div>
    </div>
  );
}
