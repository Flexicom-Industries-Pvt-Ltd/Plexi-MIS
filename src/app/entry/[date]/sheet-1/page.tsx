import { Sheet1Form } from "@/components/mis/sheets/Sheet1Form";

export default async function Sheet1Page({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <Sheet1Form dateKey={date} />;
}
