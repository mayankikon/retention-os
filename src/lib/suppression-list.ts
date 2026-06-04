const SUPPRESSION_LIST_ACCEPT = ".csv,.txt,text/csv,text/plain";

export function getSuppressionListAcceptAttribute(): string {
  return SUPPRESSION_LIST_ACCEPT;
}

export async function parseSuppressionListFile(
  file: File,
): Promise<{ fileName: string; entryCount: number }> {
  const text = await file.text();
  const entryCount = countSuppressionEntries(text);

  return {
    fileName: file.name,
    entryCount,
  };
}

export function countSuppressionEntries(contents: string): number {
  return contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#")).length;
}

export function formatSuppressionListSummary(
  fileName: string | null,
  entryCount: number | null,
): string {
  if (!fileName) return "None";

  if (entryCount === null) return fileName;

  return `${fileName} (${entryCount.toLocaleString("en-US")} numbers)`;
}
