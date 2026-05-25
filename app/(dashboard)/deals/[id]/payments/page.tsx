import DealPaymentLedgerClient from "./payment-ledger-client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DealPaymentLedgerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if ((session?.user as { orgRole?: string } | undefined)?.orgRole === "client") {
    redirect("/payments");
  }

  const { id } = await params;
  return <DealPaymentLedgerClient leadId={id} />;
}
