import { NextRequest, NextResponse } from "next/server";
import { saveSheet4, serializeMisDay } from "@/lib/mis/service";
import { sheet4Schema } from "@/lib/mis/validation";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ date: string }> },
) {
  try {
    const { date } = await context.params;
    const body = await request.json();
    const parsed = sheet4Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const misDay = await saveSheet4(date, parsed.data);
    return NextResponse.json(serializeMisDay(misDay));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save Sheet 4.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
