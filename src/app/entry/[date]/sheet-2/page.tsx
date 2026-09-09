import { Sheet2Form } from "@/components/mis/sheets/Sheet2Form";

export default async function Sheet2Page({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <Sheet2Form dateKey={date} />;
}
