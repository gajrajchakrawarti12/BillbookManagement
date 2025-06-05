import { Customer } from "../interfaces/Customer";
import API_URL from "./requests";

export async function getCustomers(companyID: string) {
  try {
    const response = await fetch(`${API_URL}/customer/${companyID}`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Get failed: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error Get costomers data:", error);
    return null;
  }
}

export async function getCustomer(customerId: string) {
  try {
    const response = await fetch(`${API_URL}/customer/id/${customerId}`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error get customer data:", error);
    return null;
  }
}

export async function postCustomer(data: Partial<Customer>) {
  try {
    const response = await fetch(`${API_URL}/customer/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Post failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log("error to post customer:", error);
    return null;
  }
}

export async function putCustomer(customerId: string, data: Partial<Customer>) {
  try {
    const response = await fetch(`${API_URL}/customer/${customerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log("error to put customer:", error);
    throw error;
  }
}

export async function deleteCustomer(customerId: string) {
  try {
    const response = await fetch(`${API_URL}/customer/${customerId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.log("error to delete customer:", error);
    throw error;
  }
}
