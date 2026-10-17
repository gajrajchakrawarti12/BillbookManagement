import type { EntityId } from "../interfaces/Company";
import type { Payment } from "../interfaces/Payment";
import { apiRequest } from "./apiClient";

export interface PaymentInput {
  paymentDate: string;
  amount: number;
  currency: string;
  paymentMethod: Payment["paymentMethod"];
  externalReference?: string | null;
  note?: string | null;
  allocations: Array<{
    invoiceId: EntityId;
    amount: number;
  }>;
}

export function getPayments(businessId: EntityId) {
  return apiRequest<Record<string, unknown>[]>(
    `/businesses/${businessId}/payments`,
  ).then((payments) => payments.map(normalizePayment));
}

export function getPayment(businessId: EntityId, paymentId: EntityId) {
  return apiRequest<Record<string, unknown>>(
    `/businesses/${businessId}/payments/${paymentId}`,
  ).then(normalizePayment);
}

function normalizePayment(payment: Record<string, unknown>): Payment {
  return {
    id: (payment.id ?? payment.payment_id) as EntityId,
    businessId: (payment.business_id ?? payment.businessId) as EntityId,
    paymentDate: String(payment.payment_date ?? payment.paymentDate ?? ""),
    amount: Number(payment.amount ?? 0),
    currency: String(payment.currency ?? "INR"),
    paymentMethod: (payment.payment_method ?? payment.paymentMethod ?? "OTHER") as Payment["paymentMethod"],
    externalReference: (payment.external_reference ?? payment.externalReference) as string | null | undefined,
    note: payment.note as string | null | undefined,
  };
}

export function postPayment(businessId: EntityId, data: PaymentInput) {
  return apiRequest<Payment>(`/businesses/${businessId}/payments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
