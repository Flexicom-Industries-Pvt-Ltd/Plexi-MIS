import { NextResponse } from "next/server";
import { getDashboardData, serializeMisDay } from "@/lib/mis/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const days = await getDashboardData();
    return NextResponse.json(days.map(serializeMisDay));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load dashboard data." }, { status: 500 });
  }
}
