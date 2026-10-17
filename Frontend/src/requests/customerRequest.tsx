import type { EntityId } from "../interfaces/Company";
import type { Address } from "../interfaces/Invoice";
import type { Customer, Subject, SubjectType } from "../interfaces/Customer";
import { apiRequest } from "./apiClient";

export interface SubjectInput {
  subjectType: SubjectType;
  name: string;
  taxId?: string;
  vatId?: string;
  businessRegistrationId?: string;
  email?: string;
  phone?: string;
  companyId?: string;
}

export interface AddressInput {
  addressLine1: string;
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
}

export function subjectToCustomer(subject: Subject, businessId: EntityId): Customer {
  const raw = subject as Subject & Record<string, unknown>;
  return {
    ...subject,
    id: subject.id ?? (raw.subject_id as EntityId | undefined),
    name: subject.name ?? String(raw.subject_name ?? ""),
    fullName: subject.name ?? String(raw.subject_name ?? ""),
    _id: String(subject.id ?? raw.subject_id ?? ""),
    companyId: String(subject.businessId ?? raw.business_id ?? businessId),
    gstin: subject.taxId ?? (raw.tax_id as string | undefined),
    pan: subject.vatId ?? (raw.vat_id as string | undefined),
    email: subject.email ?? undefined,
    phone: subject.phone ?? String(raw.phone ?? ""),
    address: {
      addressLine1: "",
      city: "",
      countryCode: "",
      address: "",
      state: "",
      country: "",
      pincode: "",
    },
  };
}

export async function getCustomers(
  businessId: EntityId,
  active = true,
): Promise<Customer[]> {
  const subjects = await apiRequest<Subject[]>(
    `/businesses/${businessId}/subjects?active=${active}`,
  );
  return subjects.map((subject) => subjectToCustomer(subject, businessId));
}

export async function getCustomer(
  businessId: EntityId,
  subjectId: EntityId,
): Promise<Subject> {
  return apiRequest<Subject>(`/businesses/${businessId}/subjects/${subjectId}`);
}

export async function postCustomer(
  businessId: EntityId,
  data: SubjectInput,
) {
  return apiRequest<Subject>(`/businesses/${businessId}/subjects`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function putCustomer(
  businessId: EntityId,
  subjectId: EntityId,
  data: Partial<SubjectInput>,
) {
  return apiRequest<Subject>(`/businesses/${businessId}/subjects/${subjectId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(businessId: EntityId, subjectId: EntityId) {
  return apiRequest<void>(`/businesses/${businessId}/subjects/${subjectId}`, {
    method: "DELETE",
  });
}

export async function getSubjectAddresses(businessId: EntityId, subjectId: EntityId) {
  return apiRequest<Address[]>(
    `/businesses/${businessId}/subjects/${subjectId}/addresses`,
  );
}

export async function postSubjectAddress(
  businessId: EntityId,
  subjectId: EntityId,
  data: AddressInput,
) {
  return apiRequest<Address>(
    `/businesses/${businessId}/subjects/${subjectId}/addresses`,
    { method: "POST", body: JSON.stringify(data) },
  );
}

export async function deleteSubjectAddress(
  businessId: EntityId,
  subjectId: EntityId,
  addressId: EntityId,
) {
  return apiRequest<void>(
    `/businesses/${businessId}/subjects/${subjectId}/addresses/${addressId}`,
    { method: "DELETE" },
  );
}
