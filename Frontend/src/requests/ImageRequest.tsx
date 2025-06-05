import API_URL from "./requests";

export async function uploadImage(data: File | undefined) {
  if (!data) {
    throw new Error("No file provided for upload.");
  }

  const formData = new FormData();
  formData.append("file", data);

  try {
    const response = await fetch(`${API_URL}/files/`, {
      method: "POST",
      body: formData,
      credentials: "include", // equivalent to withCredentials: true
    });
    console.log(response);
    

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function deleteImage(filename: string) {
  try {
    const response = await fetch(`${API_URL}/files/${filename}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

export async function updateImage(filename: string, data: File | undefined) {
  if (!data) {
    throw new Error("No file provided for upload.");
  }

  const formData = new FormData();
  formData.append("file", data);

  try {
    const response = await fetch(`${API_URL}/files/${filename}`, {
      method: "PUT",
      body: formData,
      credentials: "include", // equivalent to withCredentials: true
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating image:", error);
    throw error;
  }
}
