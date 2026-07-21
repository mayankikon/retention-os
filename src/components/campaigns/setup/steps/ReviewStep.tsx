"use client";

import { useState } from "react";
import { AlertCircle, CalendarClock, Send, ShieldCheck, Users } from "lucide-react";
import { FormField } from "@/components/campaigns/setup/FormField";
import { SuppressionListUpload } from "@/components/campaigns/setup/SuppressionListUpload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProductVersion } from "@/contexts/product-version-context";
import {
  estimateAudienceReach,
  estimateDeliverableReach,
  summarizeAudienceFilters,
} from "@/lib/audience-filters";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

interface ReviewStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
  onTestSend: () => void;
  onActivateNow: () => void;
  onSchedule: (activateOnDate: string) => void;
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
  onSchedule,
  onSaveDraft,
  isTestSent,
  isActivating,
}: ReviewStepProps) {
  const { versionId } = useProductVersion();
  const isPocVersion = versionId === "poc_v0_5";
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );
  const [scheduleMode, setScheduleMode] = useState(false);
  const [activateOnDate, setActivateOnDate] = useState("");

  const handleTestSend = async () => {
    setTestStatus("sending");
    await new Promise((resolve) => setTimeout(resolve, 800));
    setTestStatus("sent");
    onTestSend();
  };

  const audienceSummary = summarizeAudienceFilters(draft.audienceFilters);
  const customersTargeted = estimateAudienceReach(draft.audienceFilters);
  const customersReached = estimateDeliverableReach(customersTargeted);
  const canLaunch = draft.tcpaComplianceConfirmed && !isActivating;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
            <Users className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">
              Audience summary
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Estimated customers for this campaign after your trigger and
              audience filters.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-muted/20 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Customers targeted
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                  ~{customersTargeted.toLocaleString("en-US")}
                </p>
              </div>
              <div className="rounded-md border border-border bg-muted/20 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Roughly reachable
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                  ~{customersReached.toLocaleString("en-US")}
                </p>
              </div>
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

      {!isPocVersion ? (
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
      ) : null}

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

      <div className="space-y-4 border-t border-border pt-6">
        {scheduleMode ? (
          <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
            <div className="flex items-start gap-2">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <div>
                <h3 className="text-sm font-semibold">Schedule activation</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose the date this campaign should become active.
                </p>
              </div>
            </div>
            <FormField
              label="Activation date"
              htmlFor="activateOnDate"
              required
              error={errors.scheduledActivateAt}
            >
              <Input
                id="activateOnDate"
                type="date"
                value={activateOnDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setActivateOnDate(e.target.value)}
              />
            </FormField>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!canLaunch || !activateOnDate}
                onClick={() => onSchedule(activateOnDate)}
              >
                {isActivating ? "Scheduling…" : "Confirm schedule"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduleMode(false)}
                disabled={isActivating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isActivating}
              >
                Save draft
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              onClick={onActivateNow}
              disabled={!canLaunch}
            >
              {isActivating ? "Activating…" : "Activate now"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setScheduleMode(true)}
              disabled={!canLaunch}
            >
              <CalendarClock className="h-4 w-4" aria-hidden />
              Schedule
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={isActivating}
            >
              Save draft
            </Button>
          </div>
        )}
        {!draft.tcpaComplianceConfirmed ? (
          <p className="text-sm text-muted-foreground">
            Confirm TCPA compliance above to enable activation or scheduling.
          </p>
        ) : null}
      </div>
    </div>
  );
}
