import { Sheet3Form } from "@/components/mis/sheets/Sheet3Form";

export default async function Sheet3Page({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <Sheet3Form dateKey={date} />;
}
