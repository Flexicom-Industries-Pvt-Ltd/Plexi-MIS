import { ReviewPage } from "@/components/mis/sheets/ReviewPage";

export default async function ReviewRoutePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <ReviewPage dateKey={date} />;
}
