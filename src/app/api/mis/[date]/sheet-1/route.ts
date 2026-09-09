import { NextRequest, NextResponse } from "next/server";
import { saveSheet1, serializeMisDay } from "@/lib/mis/service";
import { sheet1Schema } from "@/lib/mis/validation";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ date: string }> },
) {
  try {
    const { date } = await context.params;
    const body = await request.json();
    const parsed = sheet1Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const misDay = await saveSheet1(date, parsed.data);
    return NextResponse.json(serializeMisDay(misDay));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save Sheet 1.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
