import { User } from "../interfaces/User";
import API_URL from "./requests";

export async function updateUserData(username: string, data: Partial<User>) {
  try {
    const response = await fetch(`${API_URL}/users/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies if needed
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}
