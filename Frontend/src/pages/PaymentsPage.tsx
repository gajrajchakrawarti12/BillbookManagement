import { useEffect, useState } from "react";
import type React from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import { getPayments, postPayment } from "../requests/paymentRequest";
import { getInvoices } from "../requests/InvoiceRequest";
import type { Invoice } from "../interfaces/Invoice";
import type { Payment } from "../interfaces/Payment";
import { format } from "date-fns";

export function PaymentsPage() {
  const { user } = useAuth();
  const businessId = user?.businessId ?? user?.companyId;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Payment["paymentMethod"]>("BANK_TRANSFER");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    let active = true;
    Promise.all([getPayments(businessId), getInvoices(businessId, "ISSUED")])
      .then(([paymentResponse, invoiceResponse]) => {
        if (active) {
          setPayments(paymentResponse);
          setInvoices(invoiceResponse);
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load payments.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.businessId, user?.companyId]);

  const recordPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!businessId || !invoiceId || Number(amount) <= 0) {
      setError("Select an issued invoice and enter a positive amount.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await postPayment(businessId, {
        paymentDate: new Date().toISOString().slice(0, 10),
        amount: Number(amount),
        currency: "INR",
        paymentMethod: method,
        allocations: [{ invoiceId, amount: Number(amount) }],
      });
      setAmount("");
      setInvoiceId("");
      setPayments(await getPayments(businessId));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to record payment.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">Cash flow</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Payments</h1>
        <p className="mt-2 text-sm text-slate-500">Payments recorded for this business workspace.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={recordPayment} className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="payment-invoice">Issued invoice</Label>
              <select id="payment-invoice" value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)} className="h-10 w-full rounded-md border px-3 text-sm">
                <option value="">Select invoice</option>
                {invoices.map((invoice) => <option key={String(invoice.id)} value={String(invoice.id)}>{invoice.invoiceNumber} — {invoice.totalInclTax?.toFixed(2)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount</Label>
              <Input id="payment-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Method</Label>
              <select id="payment-method" value={method} onChange={(event) => setMethod(event.target.value as Payment["paymentMethod"])} className="h-10 w-full rounded-md border px-3 text-sm">
                {["CASH", "BANK_TRANSFER", "CARD", "CHEQUE", "UPI", "OTHER"].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <Button type="submit" disabled={isSaving} className="md:col-span-4 md:w-fit">{isSaving ? "Saving..." : "Record payment"}</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment activity</CardTitle>
          <CardDescription>{payments.length} payment{payments.length === 1 ? "" : "s"} returned by the API.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div>
          ) : error ? (
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
          ) : payments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">No payments have been recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <tr><th className="px-3 py-3">Date</th><th className="px-3 py-3">Method</th><th className="px-3 py-3">Reference</th><th className="px-3 py-3 text-right">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={String(payment.id)} className="text-slate-700">
                      <td className="px-3 py-4">{format(new Date(payment.paymentDate), "dd MMM yyyy")}</td>
                      <td className="px-3 py-4 font-medium">{payment.paymentMethod}</td>
                      <td className="px-3 py-4 text-slate-500">{payment.externalReference || "—"}</td>
                      <td className="px-3 py-4 text-right font-semibold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: payment.currency || "INR" }).format(payment.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
