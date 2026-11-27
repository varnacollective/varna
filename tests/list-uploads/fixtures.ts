import type { Supplier } from "@/agents/list/core/supplier";
import type { Evidence, Issue } from "@/lib/list-uploads/types";

// Synthetic data only.

export function supplier(extra: Partial<Supplier> = {}): Supplier {
  return {
    id: "6f1c2d3e-4a5b-4c6d-8e7f-0a1b2c3d4e5f",
    client_id: "11111111-1111-4111-8111-111111111111",
    programme_id: "22222222-2222-4222-8222-222222222222",
    upload_id: "33333333-3333-4333-8333-333333333333",
    company_name: "Example Handloom",
    contact_name: "Asha Rao",
    emails: ["asha@example.com"],
    phones: ["+919000000001"],
    city: "Jaipur",
    state: "Rajasthan",
    raw_values: { A2: "Example Handloom", B2: "asha@example.com" },
    suggestions: [],
    source: { file_id: "44444444-4444-4444-8444-444444444444", file_name: "vendors.xlsx", sheet: "Vendors", row: 2 },
    field_confidence: {},
    flags: [],
    status: "READY",
    extraction_method: "ai_text",
    created_at: "2026-11-27T10:00:00Z",
    ...extra,
  };
}

export const attention = (code: string): Issue => ({ code, level: "attention", message: code });
export const info = (code: string): Issue => ({ code, level: "info", message: code });

export function evidence(extra: Partial<Evidence> = {}): Evidence {
  return { fileName: "vendors.xlsx", sheet: "Vendors", row: 2, readFromImage: false, cells: [], ...extra };
}
