import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import type { Invoice } from "../interfaces/Invoice";
import {
  creditInvoice,
  getInvoice,
  issueInvoice,
  voidInvoice,
} from "../requests/InvoiceRequest";
import Loader from "./Loader";

export function InvoiceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const businessId = user?.businessId ?? user?.companyId;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadInvoice = async () => {
    if (!businessId || !id) return;
    setIsLoading(true);
    try {
      setInvoice(await getInvoice(businessId, id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInvoice();
  }, [businessId, id]);

  const changeStatus = async (action: "issue" | "void") => {
    if (!businessId || !id) return;
    try {
      const updated =
        action === "issue"
          ? await issueInvoice(businessId, id)
          : await voidInvoice(businessId, id);
      setInvoice(updated);
      setMessage(`Invoice ${action === "issue" ? "issued" : "voided"} successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update invoice.");
    }
  };

  const createCreditNote = async () => {
    if (!businessId || !id) return;
    try {
      const creditNote = await creditInvoice(businessId, id, {
        invoiceNumber: `${invoice?.invoiceNumber}-CN-${Date.now()}`.slice(0, 50),
        documentType: "CREDIT_NOTE",
        issuerSubjectId: invoice?.issuerSubjectId ?? undefined,
        buyerSubjectId: invoice?.buyerSubjectId ?? "",
        creditedInvoiceId: invoice?.id ?? id,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: invoice?.dueDate ?? undefined,
        currency: invoice?.currency ?? "INR",
        note: `Credit note for ${invoice?.invoiceNumber}`,
        issuerNameSnapshot: invoice?.issuerNameSnapshot ?? "",
        buyerNameSnapshot: invoice?.buyerNameSnapshot ?? "",
        items: invoice?.items.map((item) => ({
          productId: item.productId,
          description: item.descriptionSnapshot,
          unitOfMeasure: item.unitOfMeasureSnapshot ?? "unit",
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? 0,
          discountAmount: item.discountAmount ?? 0,
          taxRate: item.taxRate,
        })) ?? [],
      });
      setMessage(`Credit note ${creditNote.invoiceNumber} created as a draft.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create credit note.");
    }
  };

  if (isLoading) return <Loader />;
  if (!invoice) {
    return <p className="rounded-xl bg-red-50 p-4 text-red-700">{message ?? "Invoice not found."}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 print:block">
      <div className="flex items-center justify-between print:hidden">
        <Button asChild variant="ghost">
          <Link to="/invoices"><ArrowLeft className="mr-2 h-4 w-4" />Back to invoices</Link>
        </Button>
        <div className="flex gap-2">
          {invoice.status === "DRAFT" && (
            <Button onClick={() => void changeStatus("issue")}>Issue invoice</Button>
          )}
          {(invoice.status === "DRAFT" || invoice.status === "ISSUED") && (
            <Button variant="outline" onClick={() => void changeStatus("void")}>Void</Button>
          )}
          {invoice.status === "ISSUED" && (
            <Button variant="outline" onClick={() => void createCreditNote()}>Create credit note</Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />Print / Save PDF
          </Button>
        </div>
      </div>
      {message && <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700 print:hidden">{message}</p>}

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Invoice {invoice.invoiceNumber}</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                {invoice.issuerNameSnapshot} → {invoice.buyerNameSnapshot}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{invoice.status}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <div><p className="text-slate-500">Issue date</p><p className="font-medium">{invoice.issueDate ?? "Draft"}</p></div>
            <div><p className="text-slate-500">Due date</p><p className="font-medium">{invoice.dueDate ?? "—"}</p></div>
            <div><p className="text-slate-500">Currency</p><p className="font-medium">{invoice.currency ?? "INR"}</p></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr><th className="py-3">Description</th><th className="py-3">Qty</th><th className="py-3">Unit price</th><th className="py-3 text-right">Gross</th></tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">{item.descriptionSnapshot || item.productCodeSnapshot || "Item"}</td>
                    <td className="py-3">{item.quantity}</td>
                    <td className="py-3">{item.unitPrice?.toFixed(2)}</td>
                    <td className="py-3 text-right">{item.grossAmount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{invoice.totalExclTax?.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{invoice.totalTax?.toFixed(2)}</span></div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold"><span>Total</span><span>{invoice.totalInclTax?.toFixed(2)}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
