/**
 * POST /api/generate-assessment-link
 *
 * Security fixes applied:
 *   F7 – Requires a valid superadmin signed session.
 *   F7 – Inserts expires_at (7 days from now) into assessment_links.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    // ── Auth: superadmin only ─────────────────────────────────────────────────
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorised. Superadmin session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { enterprise_name } = body;

    if (
      !enterprise_name ||
      typeof enterprise_name !== "string" ||
      !enterprise_name.trim()
    ) {
      return NextResponse.json(
        { error: "Enterprise name is required." },
        { status: 400 }
      );
    }

    const uuid = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const supabase = createAdminClient();
    const { error } = await supabase.from("assessment_links").insert({
      uuid,
      enterprise_name: enterprise_name.trim(),
      expires_at: expiresAt.toISOString(),
      status: "Pending",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        {
          error:
            "Failed to save assessment link. Ensure the assessment_links table exists.",
        },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const link = `${baseUrl}/assessment/${uuid}`;

    return NextResponse.json({
      link,
      uuid,
      enterprise_name: enterprise_name.trim(),
      expires_at: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("generate-assessment-link error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
