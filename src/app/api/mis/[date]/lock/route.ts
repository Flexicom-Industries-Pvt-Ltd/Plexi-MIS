import { NextRequest, NextResponse } from "next/server";
import { lockMisDay, serializeMisDay } from "@/lib/mis/service";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ date: string }> },
) {
  try {
    const { date } = await context.params;
    const misDay = await lockMisDay(date);
    return NextResponse.json(serializeMisDay(misDay));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not lock MIS.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
