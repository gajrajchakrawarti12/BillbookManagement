import { apiRequest } from "./apiClient";
import type { MembershipRole } from "../interfaces/User";
import type {
  Business as BusinessModel,
  DashboardSummary,
  EntityId,
} from "../interfaces/Company";

export type { DashboardSummary } from "../interfaces/Company";

export type Business = BusinessModel;

export function normalizeBusiness(
  business: Record<string, unknown>,
): Business {
  return {
    id: (business.id ?? business.business_id) as EntityId,
    legalName: String(business.legal_name ?? business.legalName ?? ""),
    displayName: (business.display_name ?? business.displayName ?? null) as
      | string
      | null,
    businessRegistrationId: (business.business_registration_id ??
      business.businessRegistrationId ??
      null) as string | null,
    defaultCurrency: String(
      business.default_currency ?? business.defaultCurrency ?? "INR",
    ),
    isActive: Boolean(business.is_active ?? business.isActive ?? true),
    createdAt: String(business.created_at ?? business.createdAt ?? ""),
    updatedAt: String(business.updated_at ?? business.updatedAt ?? ""),
  };
}

export async function getBusinesses(): Promise<Business[]> {
  const response = await apiRequest<
    Record<string, unknown>[] | { businesses: Record<string, unknown>[] }
  >("/businesses");
  const businesses = Array.isArray(response) ? response : response.businesses;
  return businesses.map(normalizeBusiness);
}

export async function getBusinessDashboard(businessId: EntityId) {
  return apiRequest<DashboardSummary>(`/businesses/${businessId}/dashboard`);
}

export async function createBusiness(data: {
  legalName: string;
  displayName?: string;
  businessRegistrationId?: string;
  defaultCurrency?: string;
}) {
  return apiRequest<Business>("/businesses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getBusiness(businessId: EntityId) {
  const business = await apiRequest<Record<string, unknown>>(
    `/businesses/${businessId}`,
  );
  return normalizeBusiness(business);
}

export interface BusinessMemberInput {
  userId: EntityId;
  role: MembershipRole;
}

export interface BusinessMemberResponse {
  message: string;
}

export async function addBusinessMember(
  businessId: EntityId,
  data: BusinessMemberInput,
) {
  return apiRequest<BusinessMemberResponse>(`/businesses/${businessId}/members`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeBusinessMember(
  businessId: EntityId,
  userId: EntityId,
) {
  return apiRequest<BusinessMemberResponse>(
    `/businesses/${businessId}/members/${userId}`,
    { method: "DELETE" },
  );
}
