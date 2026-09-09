import { NextRequest, NextResponse } from "next/server";
import { serializeMisDay, submitMisDay } from "@/lib/mis/service";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ date: string }> },
) {
  try {
    const { date } = await context.params;
    const misDay = await submitMisDay(date);
    return NextResponse.json(serializeMisDay(misDay));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit MIS.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
