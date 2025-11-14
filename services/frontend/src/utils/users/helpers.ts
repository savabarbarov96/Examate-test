import { IUser } from "../../../../user-service/models/User";
import { CreateUserPayload, GetUserPayload, UpdateUserPayload } from "./types";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

// CREATE
export const createUser = async (
  formData: FormData
): Promise<CreateUserPayload | null> => {
  try {
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      credentials: "include",
      body: formData,
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
export const getAllUsers = async (): Promise<GetUserPayload[] | null> => {
  try {
    const res = await fetch(`${BASE_URL}/api/users`, {
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

export const getCurrentUser = async (): Promise<GetUserPayload | null> => {
  try {
    const res = await fetch(`${BASE_URL}/api/users/me`, {
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

export const getUserById = async (
  id: string
): Promise<GetUserPayload | null> => {
  try {
    const res = await fetch(`${BASE_URL}/api/users/${id}`, {
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

// UPDATE
export const updateUser = async (
  id: string,
  formData: FormData
): Promise<IUser | null> => {
  try {
    const res = await fetch(`${BASE_URL}/api/users/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
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
    const res = await fetch(`${BASE_URL}/api/users/${id}`, {
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
