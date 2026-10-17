import type { EntityId, IsoDateTime, CurrencyCode } from "./Company";

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "CARD"
  | "CHEQUE"
  | "UPI"
  | "OTHER";

export interface PaymentAllocation {
  paymentId?: EntityId;
  invoiceId: EntityId;
  amount: number;
  createdAt?: IsoDateTime;
}

export interface Payment {
  id?: EntityId;
  businessId: EntityId;
  paymentDate: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
  externalReference?: string | null;
  note?: string | null;
  createdBy?: EntityId | null;
  allocations?: PaymentAllocation[];
  createdAt?: IsoDateTime;
}
