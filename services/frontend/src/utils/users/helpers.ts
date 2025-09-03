export type User = {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
};

export type GetAllUsersResponse = {
  status: string;
  results: number;
  data: User[];
};

export const getAllUsers = async (): Promise<GetAllUsersResponse | null> => {
  try {
    const res = await fetch("http://localhost:8082/api/users", {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch users: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};
