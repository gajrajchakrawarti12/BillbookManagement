interface Address {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface InvoiceItem {
  id: string;
  productId: string;
  hsn: string;
  quantity: number;
  rate: number;
  discount: number;
  taxRate: number;
  amount: number;
}

interface Invoice {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  invoiceNumber: string;
  dueDate?: string;
  customerId?: string;
  address?: Address;
  items: InvoiceItem[];
  subTotal: number;
  taxTotal: number;
  discountAmount?: number;
  total: number;
  status: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
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
  currency?: string;
}

export type {
  Invoice,
  InvoiceItem,
  Address
};
