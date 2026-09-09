import { redirect } from "next/navigation";
import { format } from "date-fns";

export default function EntryIndexPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  redirect(`/entry/${today}/sheet-1`);
}
