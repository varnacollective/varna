import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("varna_session");
  response.cookies.delete("varna_superadmin_session");
  return response;
}
