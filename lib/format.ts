export function formatPrice(amountXaf: number): string {
  return `${amountXaf.toLocaleString("en-US")} FCFA`;
}
