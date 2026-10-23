import { cn } from "@/lib/utils";

/**
 * Shared anatomy for the campaign wizard's cards so every step uses one
 * pattern: 4px radius, p-4, green border + tint when selected.
 */
export const SECTION_CARD_CLASS =
  "rounded-[var(--radius-sm)] border border-border bg-card p-4";

/** Selectable card (dealership, channel, template, trigger, reminder). */
export function optionCardClassName(
  selected: boolean,
  { interactive = false }: { interactive?: boolean } = {},
) {
  return cn(
    SECTION_CARD_CLASS,
    "transition-colors",
    selected && "border-primary bg-primary/5",
    interactive && !selected && "hover:bg-muted/40",
  );
}

/**
 * Content revealed inside a card. Indented to line up with the title text
 * when the card has a checkbox/radio (16px control + 12px gap).
 */
export function optionCardNestedClassName(hasControl: boolean) {
  return cn("mt-4 space-y-4", hasControl && "pl-7");
}

/** Title + description shown beside a card's control. */
export function OptionCardText({
  title,
  description,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium text-foreground">{title}</span>
      {description ? (
        <span className="mt-1 block text-xs text-muted-foreground">
          {description}
        </span>
      ) : null}
    </span>
  );
}
