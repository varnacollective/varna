import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enterprise_name } = body;

    if (!enterprise_name || typeof enterprise_name !== "string" || !enterprise_name.trim()) {
      return NextResponse.json(
        { error: "Enterprise name is required." },
        { status: 400 }
      );
    }

    const uuid = crypto.randomUUID();

    const supabase = await createClient();
    const { error } = await supabase
      .from("assessment_links")
      .insert({ uuid, enterprise_name: enterprise_name.trim() });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save assessment link. Ensure the assessment_links table exists." },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const link = `${baseUrl}/assessment/${uuid}`;

    return NextResponse.json({ link, uuid, enterprise_name: enterprise_name.trim() });
  } catch (err) {
    console.error("generate-assessment-link error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
