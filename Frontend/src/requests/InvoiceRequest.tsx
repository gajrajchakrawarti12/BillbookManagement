import type { EntityId } from "../interfaces/Company";
import type { Invoice, InvoiceStatus } from "../interfaces/Invoice";
import { apiRequest } from "./apiClient";

export interface InvoiceCreateItem {
  productId: EntityId;
  description?: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  discountAmount?: number;
  taxRate?: number;
}

export interface InvoiceCreatePayload {
  invoiceNumber: string;
  documentType?: "INVOICE" | "CREDIT_NOTE";
  issuerSubjectId?: EntityId;
  buyerSubjectId: EntityId;
  creditedInvoiceId?: EntityId | null;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  note?: string;
  reference?: string;
  issuerNameSnapshot: string;
  buyerNameSnapshot: string;
  description?: string;
  items: InvoiceCreateItem[];
}

function normalizeInvoiceItem(
  item: Record<string, unknown>,
): Invoice["items"][number] {
  const unitPrice = Number(item.unit_price ?? item.unitPrice ?? 0);
  const discountAmount = Number(
    item.discount_amount ?? item.discountAmount ?? 0,
  );
  const grossAmount = Number(item.gross_amount ?? item.grossAmount ?? 0);
  return {
    id: String(item.id ?? item.line_number ?? ""),
    invoiceId: (item.invoice_id ?? item.invoiceId) as EntityId | undefined,
    lineNumber: Number(item.line_number ?? item.lineNumber ?? 0),
    productId: String(item.product_id ?? item.productId ?? ""),
    productCodeSnapshot: (item.product_code_snapshot ??
      item.productCodeSnapshot) as string | null | undefined,
    descriptionSnapshot: String(
      item.description_snapshot ?? item.descriptionSnapshot ?? "",
    ),
    unitOfMeasureSnapshot: String(
      item.unit_of_measure_snapshot ?? item.unitOfMeasureSnapshot ?? "unit",
    ),
    quantity: Number(item.quantity ?? 0),
    unitPrice,
    discountAmount,
    netAmount: Number(item.net_amount ?? item.netAmount ?? 0),
    taxRate: Number(item.tax_rate ?? item.taxRate ?? 0),
    taxAmount: Number(item.tax_amount ?? item.taxAmount ?? 0),
    grossAmount,
    hsn: String(item.description_snapshot ?? item.descriptionSnapshot ?? ""),
    rate: unitPrice,
    discount: discountAmount,
    amount: grossAmount,
  };
}

function normalizeInvoice(raw: Record<string, unknown>): Invoice {
  const totalExclTax = Number(raw.total_excl_tax ?? raw.totalExclTax ?? 0);
  const totalTax = Number(raw.total_tax ?? raw.totalTax ?? 0);
  const totalInclTax = Number(raw.total_incl_tax ?? raw.totalInclTax ?? 0);
  const items = Array.isArray(raw.items)
    ? raw.items.map((item) =>
        normalizeInvoiceItem(item as Record<string, unknown>),
      )
    : [];
  return {
    ...raw,
    id: (raw.id ?? raw.invoice_id ?? raw._id) as EntityId | undefined,
    _id: String(raw.id ?? raw.invoice_id ?? raw._id ?? ""),
    businessId: (raw.business_id ?? raw.businessId) as EntityId | undefined,
    invoiceNumber: String(raw.invoice_number ?? raw.invoiceNumber ?? ""),
    documentType: (raw.document_type ??
      raw.documentType) as Invoice["documentType"],
    issuerSubjectId: (raw.issuer_subject_id ??
      raw.issuerSubjectId) as EntityId | null | undefined,
    buyerSubjectId: (raw.buyer_subject_id ??
      raw.buyerSubjectId) as EntityId | null | undefined,
    creditedInvoiceId: (raw.credited_invoice_id ??
      raw.creditedInvoiceId) as EntityId | null | undefined,
    status: String(raw.status_code ?? raw.status ?? "DRAFT") as Invoice["status"],
    issueDate: (raw.issue_date ?? raw.issueDate) as string | null | undefined,
    dueDate: (raw.due_date ?? raw.dueDate) as string | null | undefined,
    currency: String(raw.currency ?? "INR"),
    note: (raw.note ?? null) as string | null,
    reference: (raw.reference ?? null) as string | null,
    issuerNameSnapshot: String(
      raw.issuer_name_snapshot ?? raw.issuerNameSnapshot ?? "",
    ),
    buyerNameSnapshot: String(
      raw.buyer_name_snapshot ?? raw.buyerNameSnapshot ?? "",
    ),
    totalExclTax,
    totalTax,
    totalInclTax,
    items,
    subTotal: totalExclTax,
    taxTotal: totalTax,
    total: totalInclTax,
  };
}

export async function getInvoices(
  businessId: EntityId,
  status?: InvoiceStatus,
) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const invoices = await apiRequest<Record<string, unknown>[]>(
    `/businesses/${businessId}/invoices${query}`,
  );
  return invoices.map(normalizeInvoice);
}

export async function getInvoice(businessId: EntityId, invoiceId: EntityId) {
  const invoice = await apiRequest<Record<string, unknown>>(
    `/businesses/${businessId}/invoices/${invoiceId}`,
  );
  return normalizeInvoice(invoice);
}

export async function postInvoice(
  businessId: EntityId,
  data: InvoiceCreatePayload,
) {
  const invoice = await apiRequest<Record<string, unknown>>(
    `/businesses/${businessId}/invoices`,
    { method: "POST", body: JSON.stringify(data) },
  );
  return normalizeInvoice(invoice);
}

export async function issueInvoice(businessId: EntityId, invoiceId: EntityId) {
  const invoice = await apiRequest<Record<string, unknown>>(
    `/businesses/${businessId}/invoices/${invoiceId}/issue`,
    { method: "POST" },
  );
  return normalizeInvoice(invoice);
}

export async function voidInvoice(businessId: EntityId, invoiceId: EntityId) {
  const invoice = await apiRequest<Record<string, unknown>>(
    `/businesses/${businessId}/invoices/${invoiceId}/void`,
    { method: "POST" },
  );
  return normalizeInvoice(invoice);
}

export async function creditInvoice(
  businessId: EntityId,
  invoiceId: EntityId,
  data: InvoiceCreatePayload,
) {
  const invoice = await apiRequest<Record<string, unknown>>(
    `/businesses/${businessId}/invoices/${invoiceId}/credit`,
    { method: "POST", body: JSON.stringify(data) },
  );
  return normalizeInvoice(invoice);
}
