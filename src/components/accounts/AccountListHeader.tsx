interface AccountListHeaderProps {
  totalCount: number;
  filteredCount: number;
}

export function AccountListHeader({
  totalCount,
  filteredCount,
}: AccountListHeaderProps) {
  const countLabel =
    filteredCount === totalCount
      ? `${totalCount} accounts`
      : `${filteredCount} of ${totalCount} accounts`;

  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Accounts
        </h1>
        <p className="text-sm text-muted-foreground">{countLabel}</p>
      </div>
    </header>
  );
}
