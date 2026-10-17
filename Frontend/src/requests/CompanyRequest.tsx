import type { Company } from "../interfaces/Company";
import type { EntityId } from "../interfaces/Company";
import { apiRequest } from "./apiClient";
import { normalizeBusiness } from "./businessRequest";

function toLegacyCompany(
  company: Company & Record<string, unknown>,
): Company & { _id: string; fullName: string } {
  const normalized = normalizeBusiness(company);
  return {
    ...normalized,
    _id: String(normalized.id ?? ""),
    fullName: normalized.displayName || normalized.legalName || "",
  };
}

export async function getCompany(id: EntityId) {
  const business = await apiRequest<Record<string, unknown>>(`/businesses/${id}`);
  return { company: toLegacyCompany(business) };
}

export async function postCompany(companyData: Partial<Company>) {
  const business = await apiRequest<Record<string, unknown>>("/businesses", {
    method: "POST",
    body: JSON.stringify({
      legalName: companyData.legalName || companyData.fullName,
      displayName: companyData.displayName || companyData.fullName,
      businessRegistrationId: companyData.businessRegistrationId,
      defaultCurrency: companyData.defaultCurrency || "INR",
    }),
  });
  return { company: toLegacyCompany(business) };
}
