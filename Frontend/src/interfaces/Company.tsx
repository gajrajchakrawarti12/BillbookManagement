export type EntityId = number | string;
export type IsoDateTime = string;
export type CurrencyCode = string;

export interface Business {
  id: EntityId;
  legalName: string;
  displayName: string | null;
  businessRegistrationId?: string | null;
  defaultCurrency: CurrencyCode;
  isActive: boolean;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface DashboardSummary {
  business: Record<string, unknown>;
  customers: number;
  products: number;
  invoices: number;
  issuedAmount: number | string;
  paidInvoices: number;
  totalRevenue?: number;
  revenue?: number;
  pendingInvoices?: number;
  totalCustomers?: number;
  totalSubjects?: number;
  outstandingAmount?: number;
}

export type Company = Partial<Business> & {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  image?: string;
  gstin?: string;
  pan?: string;
  address?: import("./Invoice").Address;
  website?: string;
};
