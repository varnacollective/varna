import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      reminder_max_count,
      reminder_window_days,
      reminder_min_gap_hours,
      invitation_expiry_days,
      certificate_expiry_warning_days,
    } = body;

    const supabase = createAdminClient();

    // Check if row exists
    const { data: existing } = await supabase
      .from("notification_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("notification_settings")
        .update({
          reminder_max_count,
          reminder_window_days,
          reminder_min_gap_hours,
          invitation_expiry_days,
          certificate_expiry_warning_days,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("notification_settings").insert({
        reminder_max_count,
        reminder_window_days,
        reminder_min_gap_hours,
        invitation_expiry_days,
        certificate_expiry_warning_days,
      });
    }

    await supabase.from("audit_log").insert({
      user_id: session.userId || "superadmin",
      action: "update_notification_settings",
      entity_type: "notification_settings",
      after_state: body,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
