import { Sheet4Form } from "@/components/mis/sheets/Sheet4Form";

export default async function Sheet4Page({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <Sheet4Form dateKey={date} />;
}
