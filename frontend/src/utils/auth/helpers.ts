export async function login(email: string, password: string) {
  try {
    const response = await fetch("http://localhost:8081/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    const token = data.token;


    localStorage.setItem("accessToken", token);

    return token;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function sendResetEmail(email: string): Promise<void> {
  const res = await fetch("http://localhost:8081/api/auth/forgotPassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Failed to send reset email");
  }
}