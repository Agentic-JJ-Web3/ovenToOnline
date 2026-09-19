import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client. Server-only: never import this file from a client
// component. SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix on purpose.
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set.");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export const PRODUCTS_BUCKET = "products";

export const PRODUCT_FILES = [
  "From_Oven_to_Online_Workbook.pdf",
  "The_Script_Pack.pdf",
  "The_Script_Pack_COPY_PASTE.txt",
] as const;
