import { NextResponse } from "next/server";
import { getConfidenceData } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getConfidenceData();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch confidence data." },
      { status: 500 }
    );
  }
}
