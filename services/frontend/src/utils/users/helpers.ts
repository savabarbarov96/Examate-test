import { IUser } from "../../../../user-service/models/User";

export type CreateUserPayload = {
  email: string;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  client: string;
  phone?: string;
  dob?: string;
  profilePic?: File; // <-- now it's a File instead of string
};

// CREATE
export const createUser = async (formData: FormData): Promise<IUser | null> => {
  try {
    const res = await fetch("https://user-service.examate.net/api/users", {
      method: "POST",
      credentials: "include",
      body: formData, // already prepared
    });

    if (!res.ok) throw new Error(`Failed to create user: ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("Create user error:", err);
    return null;
  }
};

// READ
export const getAllUsers = async (): Promise<IUser[] | null> => {
  try {
    const res = await fetch("https://user-service.examate.net/api/users", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("Get all users error:", err);
    return null;
  }
};

export const getCurrentUser = async (): Promise<IUser[] | null> => {
  try {
    const res = await fetch("https://user-service.examate.net/api/users/me", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
    const data = await res.json();
    console.log({ data });

    return data.data;
  } catch (err) {
    console.error("Get all users error:", err);
    return null;
  }
};

// UPDATE
export const updateUser = async (
  id: string,
  payload: UpdateUserPayload
): Promise<IUser | null> => {
  try {
    const res = await fetch(`https://user-service.examate.net/api/users/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("Update user error:", err);
    return null;
  }
};

// DELETE
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`https://user-service.examate.net/api/users/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
    return true;
  } catch (err) {
    console.error("Delete user error:", err);
    return false;
  }
};
