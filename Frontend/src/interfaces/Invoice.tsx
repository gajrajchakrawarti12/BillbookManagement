import type { EntityId, IsoDateTime, CurrencyCode } from "./Company";

export type InvoiceDocumentType = "INVOICE" | "CREDIT_NOTE";
export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_CREDITED"
  | "CREDITED"
  | "VOID";
export type LegacyInvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partial"
  | "overdue"
  | "cancelled";

export interface Address {
  addressLine1?: string;
  addressLine2?: string | null;
  streetNumber?: string | null;
  city: string;
  region?: string | null;
  postalCode?: string | null;
  countryCode?: string;
  addressType?: "REGISTERED" | "BILLING" | "SHIPPING" | "OTHER";
  isDefault?: boolean;
  validFrom?: string | null;
  validTo?: string | null;

  /** @deprecated Legacy screen compatibility fields. */
  address: string;
  state: string;
  country: string;
  pincode: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId?: EntityId;
  lineNumber?: number;
  productId: string;
  productCodeSnapshot?: string | null;
  descriptionSnapshot?: string;
  unitOfMeasureSnapshot?: string;
  quantity: number;
  unitPrice?: number;
  discountAmount?: number;
  netAmount?: number;
  taxRate: number;
  taxAmount?: number;
  grossAmount?: number;

  /** @deprecated Legacy form aliases. */
  hsn?: string;
  rate: number;
  discount: number;
  amount: number;
}

export interface Invoice {
  id?: EntityId;
  businessId?: EntityId;
  invoiceNumber: string;
  documentType?: InvoiceDocumentType;
  issuerSubjectId?: EntityId | null;
  buyerSubjectId?: EntityId | null;
  creditedInvoiceId?: EntityId | null;
  status: InvoiceStatus | LegacyInvoiceStatus;
  issueDate?: string | null;
  dueDate?: string | null;
  currency?: CurrencyCode;
  note?: string | null;
  reference?: string | null;
  isPaid?: boolean;
  isVatReverseCharge?: boolean;
  issuerNameSnapshot?: string;
  buyerNameSnapshot?: string;
  totalExclTax?: number;
  totalTax?: number;
  totalInclTax?: number;
  items: InvoiceItem[];
  createdBy?: EntityId | null;
  issuedAt?: IsoDateTime | null;
  createdAt?: IsoDateTime;
  updatedAt?: IsoDateTime;

  /** @deprecated Legacy screen compatibility fields. */
  _id?: string;
  customerId?: string;
  address?: Address;
  subTotal: number;
  taxTotal: number;
  discountAmount?: number;
  total: number;
  notes?: string;
  termsAndConditions?: string;
  paymentMethod?: string;
  paymentDate?: string;
  amountPaid?: number;
  balanceDue?: number;
  companyId?: string;
  userId?: string;
  isGstInvoice?: boolean;
  isExported?: boolean;
}
