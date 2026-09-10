import { NextResponse } from "next/server";
import { assertAdminSecret, AdminAuthError, readAdminSecretFromRequest } from "@/lib/mis/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertAdminSecret(readAdminSecretFromRequest(request));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not verify admin key." }, { status: 500 });
  }
}
