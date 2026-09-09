import { NextRequest, NextResponse } from "next/server";
import { getMisDay, serializeMisDay } from "@/lib/mis/service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ date: string }> },
) {
  try {
    const { date } = await context.params;
    const misDay = await getMisDay(date);
    return NextResponse.json(serializeMisDay(misDay));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load MIS record." }, { status: 500 });
  }
}
