import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { createInvitation } from "@/lib/invitations/create-invitation";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized. Superadmin role required." }, { status: 401 });
    }

    const supabase = createAdminClient();
    const [clientsRes, categoriesRes] = await Promise.all([
      supabase.from("client_master").select("id:client_id, name:client_name").order("client_name"),
      supabase.from("category_master").select("id, name").eq("is_active", true).order("name"),
    ]);

    return NextResponse.json({
      clients: clientsRes.data || [],
      categories: categoriesRes.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ clients: [], categories: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized. Superadmin role required." }, { status: 401 });
    }

    const { action = "send", ...input } = await request.json();
    const outcome = await createInvitation(input, {
      action,
      createdBy: session.userId || "superadmin",
      origin: request.nextUrl.origin,
    });

    if (!outcome.ok) return NextResponse.json(outcome.body, { status: outcome.status });
    if (outcome.kind === "preview") return NextResponse.json(outcome.body);
    return NextResponse.json({ success: true, ...outcome.body });
  } catch (err: unknown) {
    console.error("Unexpected error in /api/superadmin/invite-partner:", err);
    return NextResponse.json(
      { error: (err instanceof Error && err.message) || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
