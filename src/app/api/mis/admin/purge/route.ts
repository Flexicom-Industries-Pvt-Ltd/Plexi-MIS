import { NextResponse } from "next/server";
import { assertAdminSecret, AdminAuthError, readAdminSecretFromRequest } from "@/lib/mis/admin-auth";
import { deleteAllMisData } from "@/lib/mis/admin-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertAdminSecret(readAdminSecretFromRequest(request));
    const result = await deleteAllMisData();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not purge MIS data." }, { status: 500 });
  }
}
