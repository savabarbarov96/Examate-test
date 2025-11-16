import api from '@/utils/api';

export type Role = {
  _id: string;
  name: string;
  permissions: Record<string, string[]>;
};

export const getAllRoles = async (): Promise<Role[] | null> => {
  try {
    const res = await api.get("/api/roles");
    return res.data.roles || [];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const createRole = async (role: Partial<Role>): Promise<Role | null> => {
  try {
    const res = await api.post("/api/roles", role);
    return res.data.role;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const deleteRole = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/api/roles/${id}`);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const updateRole = async (
  id: string,
  role: Partial<Role>
): Promise<Role | null> => {
  try {
    const res = await api.patch(`/api/roles/${id}`, role);
    return res.data.role || null;
  } catch (err) {
    console.error(err);
    return null;
  }
};
