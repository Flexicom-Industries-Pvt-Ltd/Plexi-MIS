import { NextResponse } from "next/server";
import { listMisHistory } from "@/lib/mis/service";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await listMisHistory();
    return NextResponse.json(
      rows.map((row) => ({
        id: row.id,
        date: format(row.date, "yyyy-MM-dd"),
        status: row.status,
        updatedAt: row.updatedAt,
      })),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load history." }, { status: 500 });
  }
}
