import { NextResponse } from "next/server";
import { getAdminSecret } from "@/lib/mis/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ enabled: Boolean(getAdminSecret()) });
}
