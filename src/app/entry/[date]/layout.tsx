import { MisDayProvider } from "@/contexts/MisDayContext";

export default async function EntryDateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <MisDayProvider dateKey={date}>{children}</MisDayProvider>;
}
