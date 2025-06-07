import { Company } from "../interfaces/Company";
import API_URL from "./requests";

export async function getCompany(id: string) {
  try {
    const response = await fetch(`${API_URL}/companies/${id}`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      console.log(`Get comopany failed: ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

export async function postCompany(companyData: Partial<Company>) {
  try {
    const response = await fetch(`${API_URL}/companies/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log("error to post company:", error);
    throw error;
  }
}

export async function putCompany(companyId: Company["_id"], companyData: Partial<Company>) {
  try {
    const response = await fetch(`${API_URL}/companies/${companyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log("error to post company:", error);
    throw error;
  }
}
