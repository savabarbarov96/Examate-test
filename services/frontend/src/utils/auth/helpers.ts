const BASE_URL =
  import.meta.env.VITE_AUTH_API_URL || "http://localhost:5000";

async function handleResponse(res: Response) {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  return handleResponse(res);
}

export async function verify2FA(twoFAIDToken: string, twoFACode: string) {
  const res = await fetch(`${BASE_URL}/api/auth/verify-2fa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${twoFAIDToken}`,
    },
    credentials: "include",
    body: JSON.stringify({ twoFACode }),
  });

  return handleResponse(res);
}

export async function sendResetEmail(email: string) {
  const res = await fetch(`${BASE_URL}/api/auth/forgotPassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  return handleResponse(res);
}

export async function logout() {
  const res = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  return handleResponse(res);
}

export async function verifyCode(email: string, code: string) {
  const res = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, code }),
  });

  return handleResponse(res);
}

export async function changePassword(email: string, newPassword: string) {
  const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, newPassword }),
  });

  return handleResponse(res);
}

export const fetchActiveSessions = async () => {
  const res = await fetch(`${BASE_URL}/api/session/count`, {
    credentials: "include",
  });

  return handleResponse(res);
};
