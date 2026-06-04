export function formatMessageCount(count: number): string {
  return count.toLocaleString("en-US");
}

export function formatConversionRate(ratePercent: number): string {
  return `${ratePercent.toFixed(1)}%`;
}
