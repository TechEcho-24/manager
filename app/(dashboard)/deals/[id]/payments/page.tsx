import DealPaymentLedgerClient from "./payment-ledger-client";

export default async function DealPaymentLedgerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DealPaymentLedgerClient leadId={id} />;
}
