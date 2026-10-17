import type { EntityId, IsoDateTime } from "./Company";

export type MembershipRole = "OWNER" | "ADMIN" | "ACCOUNTANT" | "STAFF" | "VIEWER";

export interface BusinessMembership {
  businessId: EntityId;
  userId: EntityId;
  role: MembershipRole;
  isActive: boolean;
  createdAt?: IsoDateTime;
}

interface User {
  id?: EntityId;
  email?: string;
  displayName?: string;
  authProvider?: string;
  lastLoginAt?: IsoDateTime | null;
  createdAt?: IsoDateTime;
  updatedAt?: IsoDateTime;
  role?: MembershipRole | string;
  isActive?: boolean;
  _id?: string;
  fullName?: string;
  companyId?: string;
  username?: string;
  phone?: string;
  image?: string;
  businessId?: EntityId;
  memberships?: BusinessMembership[];
}

export type { User };
