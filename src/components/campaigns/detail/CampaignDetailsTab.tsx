import type { ReactNode } from "react";
import { CheckCircle2, MousePointerClick, Percent, Send } from "lucide-react";
import { getTimeZoneLabel } from "@/data/campaign-setup.defaults";
import { formatDealershipList, getCampaignDealers } from "@/lib/campaign-dealers";
import { formatTimestamp } from "@/lib/dates";
import {
  formatClickThroughRate,
  formatDeliveryRate,
  formatMessageCount,
} from "@/lib/format";
import type { Campaign } from "@/types/campaign";
import type { CampaignAnalytics } from "@/types/campaign-detail";

/** Every performance card shows the same empty state until the first send. */
const EMPTY_VALUE = "—";
const NO_SENDS_YET = "No sends yet";

interface CampaignDetailsTabProps {
  campaign: Campaign;
  analytics: CampaignAnalytics;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          {subtext ? (
            <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
          ) : null}
        </div>
        <div className="rounded-md bg-brand-primary/10 p-2 text-brand-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function CampaignDetailsTab({
  campaign,
  analytics,
}: CampaignDetailsTabProps) {
  const hasActivity = analytics.recipientsSent > 0;

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Performance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            High-level delivery and engagement for this campaign.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Sent To"
            value={hasActivity ? formatMessageCount(analytics.recipientsSent) : EMPTY_VALUE}
            subtext={hasActivity ? "Customers Reached" : NO_SENDS_YET}
            icon={Send}
          />
          <MetricCard
            label="Delivered"
            value={hasActivity ? formatMessageCount(analytics.deliveredCount) : EMPTY_VALUE}
            subtext={
              hasActivity
                ? `${formatDeliveryRate(analytics.deliveredCount, analytics.recipientsSent)} Delivery Rate`
                : NO_SENDS_YET
            }
            icon={CheckCircle2}
          />
          <MetricCard
            label="Clicked"
            value={hasActivity ? formatMessageCount(analytics.clickedCount) : EMPTY_VALUE}
            subtext={hasActivity ? "Unique Customers Who Tapped the Link" : NO_SENDS_YET}
            icon={MousePointerClick}
          />
          <MetricCard
            label="Click-Through Rate"
            value={hasActivity ? formatClickThroughRate(campaign.clickThroughRate) : EMPTY_VALUE}
            subtext={hasActivity ? "Of Customers Sent" : NO_SENDS_YET}
            icon={Percent}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Campaign Info</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configuration and scheduling metadata.
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField
            label="Dealerships"
            value={formatDealershipList(getCampaignDealers(campaign))}
          />
          <DetailField
            label="Time Zone"
            value={getTimeZoneLabel(campaign.timeZone)}
          />
          <DetailField label="Group" value={campaign.group} />
          <DetailField
            label="Messages Sent"
            value={formatMessageCount(campaign.messages)}
          />
          <DetailField label="Created By" value={campaign.createdBy.name} />
          <DetailField
            label="Created"
            value={formatTimestamp(campaign.createdAt)}
          />
          <DetailField
            label="Last Updated"
            value={formatTimestamp(campaign.lastUpdatedAt)}
          />
          <DetailField
            label="Next Data Refresh"
            value={formatTimestamp(campaign.nextUpdateAt)}
          />
        </dl>
      </section>
    </div>
  );
}
