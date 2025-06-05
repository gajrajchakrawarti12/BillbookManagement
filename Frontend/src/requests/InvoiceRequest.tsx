import { Invoice } from "../interfaces/Invoice";
import API_URL from "./requests";

export async function getInvoices(companyID: string) {
  try {
    const response = await fetch(`${API_URL}/invoice/${companyID}`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Get failed: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error get Invoice data:", error);
    throw error;
  }
}

export async function getInvoice(InvoiceId: string) {
  try {
    const response = await fetch(`${API_URL}/invoice/id/${InvoiceId}`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error get Invoice data:", error);
    return null;
  }
}

export async function postInvoice(data: Partial<Invoice>) {
  try {
    const response = await fetch(`${API_URL}/invoice/`, {
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
    console.log("error to post Invoice:", error);
    throw error;
  }
}

export async function putInvoice(InvoiceId: string, data: Partial<Invoice>) {
  try {
    const response = await fetch(`${API_URL}/Invoice/${InvoiceId}`, {
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
    console.log("error to post company:", error);
    throw error;
  }
}

export async function deleteInvoice(InvoiceId: string) {
  try {
    const response = await fetch(`${API_URL}/Invoice/${InvoiceId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.log("error to post company:", error);
    throw error;
  }
}
