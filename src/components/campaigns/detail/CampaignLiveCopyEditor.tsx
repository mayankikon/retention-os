"use client";

import {
  Button,
  Textarea,
  buttonVariants,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { Info, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { FormField } from "@/components/campaigns/setup/FormField";
import { TitleBar } from "@/components/layout/TitleBar";
import { useCampaigns } from "@/hooks/use-campaigns";
import {
  applyCampaignLiveCopy,
  getCampaignLiveCopy,
  validateCampaignLiveCopy,
} from "@/lib/campaign-live-copy";
import {
  setCampaignFlashMessage,
  upsertUserCreatedCampaign,
} from "@/lib/campaign-store";
import type { CampaignLiveCopy } from "@/types/campaign";
import { cn } from "@/lib/utils";

interface CampaignLiveCopyEditorProps {
  campaignId: string;
}

export function CampaignLiveCopyEditor({
  campaignId,
}: CampaignLiveCopyEditorProps) {
  const router = useRouter();
  const campaigns = useCampaigns();
  const campaign = campaigns.find((item) => item.id === campaignId);
  const originalCopy = useMemo(
    () => (campaign ? getCampaignLiveCopy(campaign) : null),
    [campaign],
  );
  const [copy, setCopy] = useState<CampaignLiveCopy | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!campaign || !originalCopy) {
    return (
      <StateMessage
        title="Campaign not found"
        description="This campaign is unavailable or may have been removed."
        href="/campaigns"
        linkLabel="Back to campaigns"
      />
    );
  }

  const detailHref = `/campaigns/${campaign.id}`;
  const editableCopy = copy ?? originalCopy;
  if (campaign.status !== "active" && campaign.status !== "paused") {
    return (
      <StateMessage
        title="Live copy edit unavailable"
        description="Only Active and Paused campaigns allow message-body edits. Drafts use Campaign Setup; completed and archived campaigns are read-only."
        href={detailHref}
        linkLabel="Back to campaign"
      />
    );
  }

  const handleInitialMessageChange = (initialMessage: string) => {
    setCopy((currentCopy) =>
      ({ ...(currentCopy ?? originalCopy), initialMessage }),
    );
    setErrors((currentErrors) => ({
      ...currentErrors,
      initialMessage: "",
    }));
  };

  const handleReminderChange = (
    reminderId: CampaignLiveCopy["reminders"][number]["id"],
    body: string,
  ) => {
    setCopy((currentCopy) =>
      ({
        ...(currentCopy ?? originalCopy),
        reminders: (currentCopy ?? originalCopy).reminders.map((reminder) =>
          reminder.id === reminderId ? { ...reminder, body } : reminder,
        ),
      }),
    );
    setErrors((currentErrors) => ({
      ...currentErrors,
      [reminderId]: "",
    }));
  };

  const handleSave = async () => {
    const validationErrors = validateCampaignLiveCopy(
      originalCopy,
      editableCopy,
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const updatedCampaign = applyCampaignLiveCopy(campaign, editableCopy);
      upsertUserCreatedCampaign(updatedCampaign);
      setCampaignFlashMessage({
        kind: "copyUpdated",
        campaignName: campaign.name,
      });
      router.push(detailHref);
    } catch {
      setSaveError("Copy could not be saved. Review your changes and try again.");
      setIsSaving(false);
    }
  };

  return (
    <div className="app-shell-scrollbar-dashed flex min-h-0 flex-1 flex-col overflow-y-auto">
      <TitleBar
        breadcrumbs={[
          { label: "Campaigns", href: "/campaigns" },
          { label: campaign.name, href: detailHref },
          { label: "Edit copy" },
        ]}
        title="Edit live campaign copy"
        titleTrailing={<CampaignStatusBadge status={campaign.status} />}
      />

      <div className="app-shell-content-px app-shell-content-pb space-y-6 pt-6">
        <div
          className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"
          role="note"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Copy-only live edit</p>
            <p className="mt-1">
              Saving keeps this campaign {campaign.status}. Updated text applies
              only to new or not-yet-sent recipients; previous messages are not
              resent. Consent, STOP, quiet-hours, and suppression rules still
              apply.
            </p>
          </div>
        </div>

        <section className="surface-stroke-sharp space-y-6 rounded-[var(--radius-sm)] bg-card p-6">
          <div className="flex items-start gap-3">
            <LockKeyhole
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div>
              <h2 className="text-sm font-semibold">Message bodies</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Personalization variables are locked and must remain in the same
                order. Campaign name, audience, schedule, dealerships, trigger,
                links, and reminder structure cannot be changed here.
              </p>
            </div>
          </div>

          <FormField
            label="Initial message"
            htmlFor="initialMessage"
            required
            error={errors.initialMessage}
          >
            <Textarea
              id="initialMessage"
              rows={6}
              value={editableCopy.initialMessage}
              onChange={(event) =>
                handleInitialMessageChange(event.target.value)
              }
              aria-describedby="locked-variable-note"
            />
          </FormField>

          {editableCopy.reminders.map((reminder) => (
            <FormField
              key={reminder.id}
              label={reminder.label}
              htmlFor={reminder.id}
              required
              error={errors[reminder.id]}
            >
              <Textarea
                id={reminder.id}
                rows={5}
                value={reminder.body}
                onChange={(event) =>
                  handleReminderChange(reminder.id, event.target.value)
                }
                aria-describedby="locked-variable-note"
              />
            </FormField>
          ))}

          <p
            id="locked-variable-note"
            className="text-xs text-muted-foreground"
          >
            Variables such as [@FN@], [@MOD@], and [@DSP@] are locked. You can
            edit only the surrounding wording.
          </p>

          {saveError ? (
            <p className="text-sm text-destructive" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(detailHref)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              aria-busy={isSaving}
            >
              {isSaving ? "Saving…" : "Save copy"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function StateMessage({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="surface-stroke-sharp rounded-[var(--radius-sm)] bg-card p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Link
        href={href}
        className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
      >
        {linkLabel}
      </Link>
    </div>
  );
}
