export type Role = {
  _id: string;
  name: string;
  permissions: Record<string, string[]>;
};

export const getAllRoles = async (): Promise<Role[] | null> => {
  try {
    const res = await fetch("https://user-service.examate.net/api/roles"
        , {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to fetch roles: ${res.status}`);
    const data = await res.json();

    return data.roles || [];
  } catch (err) {
    console.error(err);

    return null;
  }
};

export const createRole = async (role: Partial<Role>): Promise<Role | null> => {
  try {
    const res = await fetch("https://user-service.examate.net/api/roles"
        , {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(role),
    });
    if (!res.ok) throw new Error(`Failed to create role: ${res.status}`);
    const data = await res.json();

    return data.role;
  } catch (err) {
    console.error(err);

    return null;
  }
};

export const deleteRole = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`https://user-service.examate.net/api/roles/${id}`
        , {
      method: "DELETE",
      credentials: "include",
    });

    return res.ok;
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
    const res = await fetch(`https://user-service.examate.net/api/roles/${id}`
        , {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(role),
    });

    if (!res.ok) throw new Error(`Failed to update role: ${res.status}`);
    const data = await res.json();

    return data.role || null;
  } catch (err) {
    console.error(err);
    return null;
  }
};
