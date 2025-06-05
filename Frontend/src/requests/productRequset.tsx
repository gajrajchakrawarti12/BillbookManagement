import { Product } from "../interfaces/Product";
import API_URL from "./requests";

export async function getProducts(companyID: string) {
  try {
    const response = await fetch(`${API_URL}/product/${companyID}`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Get failed: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error get product data:", error);
    throw error;
  }
}

export async function getProduct(ProductId: string) {
  try {
    const response = await fetch(`${API_URL}/Product/id/${ProductId}`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error get Product data:", error);
    return null;
  }
}

export async function postProduct(data: Partial<Product>) {
  try {
    const response = await fetch(`${API_URL}/Product/`, {
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
    console.log("error to post Product:", error);
    throw error;
  }
}

export async function putProduct(ProductId: string, data: Partial<Product>) {
  try {
    const response = await fetch(`${API_URL}/Product/${ProductId}`, {
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

export async function deleteProduct(ProductId: string) {
  try {
    const response = await fetch(`${API_URL}/Product/${ProductId}`, {
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
