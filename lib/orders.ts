export type OrderStatus = "pending" | "approved" | "rejected";

export type Order = {
  id: string;
  external_reference: string;
  transaction_id: string | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  operator: string;
  amount: number;
  tier_label: string;
  status: OrderStatus;
  download_token: string;
  created_at: string;
  updated_at: string;
};

export function generateExternalReference(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `OVEN-${Date.now()}-${rand}`;
}
