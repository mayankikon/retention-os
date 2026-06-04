export function formatMessageCount(count: number): string {
  return count.toLocaleString("en-US");
}

export function formatConversionRate(ratePercent: number): string {
  return `${ratePercent.toFixed(1)}%`;
}

export function formatCurrency(amountUsd: number): string {
  return amountUsd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatOpenRate(opened: number, sent: number): string {
  if (sent === 0) return "0%";
  return `${((opened / sent) * 100).toFixed(1)}%`;
}

export function formatClickRate(clicked: number, sent: number): string {
  if (sent === 0) return "0%";
  return `${((clicked / sent) * 100).toFixed(1)}%`;
}

export function formatDeliveryRate(delivered: number, sent: number): string {
  if (sent === 0) return "0%";
  return `${((delivered / sent) * 100).toFixed(1)}%`;
}
