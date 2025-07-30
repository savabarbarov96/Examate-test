export async function login(username: string, password: string) {
  try {
    const response = await fetch("https://auth-service.examate.net:8081/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function verify2FA(twoFAIDToken: string, twoFACode: string) {
  try {
    const response = await fetch("https://auth-service.examate.net:8081/api/auth/verify-2fa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${twoFAIDToken}`,
      },
      body: JSON.stringify({ twoFACode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "2FA failed");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function sendResetEmail(
  email: string
): Promise<{ message: string }> {
  const res = await fetch("https://auth-service.examate.net:8081/api/auth/forgotPassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to send reset email");
  }

  return data;
}

export async function logout(): Promise<void> {
  const res = await fetch("https://auth-service.examate.net:8081/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Logout failed");
  }
}

export const verifyCode = async (email: string, code: string) => {
  const res = await fetch(`https://auth-service.examate.net:8081/api/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to send reset verification code");
  }

  return data;
};

export async function changePassword(
  email: string,
  newPassword: string
): Promise<any> {
  const res = await fetch("https://auth-service.examate.net:8081/api/auth/change-password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to send reset email");
  }

  return data;
}