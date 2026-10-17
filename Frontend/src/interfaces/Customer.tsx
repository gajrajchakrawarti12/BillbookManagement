import type { EntityId, IsoDateTime } from "./Company";
import type { Address } from "./Invoice";

export type SubjectType = "CUSTOMER" | "SUPPLIER" | "BOTH" | "OTHER";

export interface Subject {
  id: EntityId;
  businessId: EntityId;
  subjectType: SubjectType;
  name: string;
  taxId: string | null;
  vatId: string | null;
  businessRegistrationId: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface CustomerListItem {
  id: EntityId;
  businessId: EntityId;
  subjectType: SubjectType;
  name: string;
  taxId: string | null;
  vatId: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
}

export interface CustomerForm {
  _id?: string;
  fullName: string;
  phone: string;
  gstin?: string;
  pan?: string;
  address: Address;
  notes?: string;
  companyId: string;
  totalBilled?: number;
  outstandingAmount?: number;
  lastBilledDate?: string;
}

export type Customer = CustomerForm &
  Omit<Partial<Subject>, "email" | "phone"> & {
    email?: string;
    phone: string;
  };
