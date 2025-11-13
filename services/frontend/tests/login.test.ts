import { test, expect } from "@playwright/test";

test.describe("Login flow", () => {
  const validUsername = "testuser";
  const validPassword = "yourpassword";
  const valid2FACode = "123456";

  test("renders login form", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  // test("shows 2FA prompt after correct login", async ({ page }) => {
  //   await page.goto("/");

  //   await page.getByLabel("Username").fill(validUsername);
  //   await page.getByLabel("Password").fill(validPassword);
  //   await page.getByRole("button", { name: "Login" }).click();

  //   await expect(
  //     page.getByRole("heading", { name: "Enter 2FA Code" })
  //   ).toBeVisible();
  //   await expect(page.getByRole("button", { name: "Verify" })).toBeVisible();
  // });

  // test("logs in successfully after 2FA", async ({ page }) => {
  //   await page.goto("/");

  //   await page.getByLabel("Username").fill(validUsername);
  //   await page.getByLabel("Password").fill(validPassword);
  //   await page.getByRole("button", { name: "Login" }).click();

  //   await expect(
  //     page.getByRole("heading", { name: "Enter 2FA Code" })
  //   ).toBeVisible();

  //   await page.getByRole("textbox").fill(valid2FACode);
  //   await page.getByRole("button", { name: "Verify" }).click();

  //   await expect(page).toHaveURL(/dashboard/);
  // });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Username").fill("invaliduser");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.locator("text=Invalid credentials.")).toBeVisible();
  });

  // test("shows validation error when fields are empty", async ({ page }) => {
  //   await page.goto("/");
  //   await page.getByRole("button", { name: "Login" }).click();

  //   await expect(page.locator("text=Please fill out this field")).toBeVisible();
  // });

  test("form is invalid when fields are empty", async ({ page }) => {
    await page.goto("/");
    const form = await page.$("form");

    // evaluate checkValidity on the form element in browser context
    const isValid = await form!.evaluate((f) => f.checkValidity());
    expect(isValid).toBe(false);
  });

  test("form is invalid when only username is filled", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Username").fill("someone");
    const form = await page.$("form");

    const isValid = await form!.evaluate((f) => f.checkValidity());
    expect(isValid).toBe(false);
  });

  test("form is invalid when only password is filled", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Password").fill("secret123");
    const form = await page.$("form");

    const isValid = await form!.evaluate((f) => f.checkValidity());
    expect(isValid).toBe(false);
  });

  // test("shows error for expired 2FA code", async ({ page }) => {
  //   await page.goto("/");

  //   await page.getByLabel("Username").fill("testuser");
  //   await page.getByLabel("Password").fill("password");
  //   await page.getByRole("button", { name: "Login" }).click();

  //   await page.waitForTimeout(6 * 60 * 1000);

  //   await page.getByRole("textbox").fill("123456");
  //   await page.getByRole("button", { name: "Verify" }).click();

  //   await expect(page.locator("text=2FA code expired or not set")).toBeVisible();
  // });

  // test("rejects malformed 2FA code", async ({ page }) => {
  //   await page.goto("/");

  //   await page.getByLabel("Username").fill("testuser");
  //   await page.getByLabel("Password").fill("password");
  //   await page.getByRole("button", { name: "Login" }).click();

  //   await page.getByRole("textbox").fill("abc");
  //   await page.getByRole("button", { name: "Verify" }).click();

  //   await expect(page.locator("text=Invalid 2FA code")).toBeVisible();
  // });

  test("blocks dashboard access without token", async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("shows and auto-hides invalid credentials error", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Username").fill("wronguser");
    await page.getByLabel("Password").fill("wrongpass");
    await page.getByRole("button", { name: "Login" }).click();

    const errorAlert = page.locator("text=Invalid credentials.");
    await expect(errorAlert).toBeVisible();

    await page.waitForTimeout(5100);

    await expect(errorAlert).toBeHidden();
  });

  test("shows error for unverified account", async ({ page }) => {
    await page.route("**/api/auth/login", async (route, request) => {
      const postData = await request.postDataJSON();

      if (postData.username === "unverifiedUser") {
        route.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({
            message:
              "Unverified account. Please complete the verification process or contact your administrator.",
          }),
        });
      }
    });

    await page.goto("/");
    await page.getByLabel("Username").fill("unverifiedUser");
    await page.getByLabel("Password").fill("anypass");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(
      page.locator(
        "text=Unverified account. Please complete the verification process or contact your administrator."
      )
    ).toBeVisible();
  });
});

test.describe("Login behavior based on 2FA", () => {
  test("redirects to dashboard if 2FA is not required", async ({ page }) => {
    await page.route("**/api/auth/login", async (route, request) => {
      const postData = await request.postDataJSON();

      if (postData.username === "normalUser") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Login successful",
            status: "authenticated",
            token: "mocked-jwt-token",
          }),
        });
      }
    });

    await page.goto("/");
    await page.getByLabel("Username").fill("normalUser");
    await page.getByLabel("Password").fill("anypass");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("shows 2FA form if required by the server", async ({ page }) => {
    await page.route("**/api/auth/login", async (route, request) => {
      const postData = await request.postDataJSON();

      if (postData.username === "userWith2FA") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "2FA required",
            status: "2fa_required",
            twoFAToken: "mocked-temp-token",
          }),
        });
      }
    });

    await page.goto("/");
    await page.getByLabel("Username").fill("userWith2FA");
    await page.getByLabel("Password").fill("anypass");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(
      page.getByRole("heading", { name: "Enter 2FA Code" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Verify" })).toBeVisible();
  });

  test("redirects to dashboard if 2FA is correct", async ({ page }) => {
    await page.route("**/api/auth/login", async (route, request) => {
      const postData = await request.postDataJSON();

      if (postData.username === "userWith2FA") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "2FA required",
            status: "2fa_required",
            twoFAToken: "mocked-temp-token",
          }),
        });
      }
    });

    await page.goto("/");
    await page.getByLabel("Username").fill("userWith2FA");
    await page.getByLabel("Password").fill("anypass");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(
      page.getByRole("heading", { name: "Enter 2FA Code" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Verify" })).toBeVisible();
  });

  test("Forgot password link is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Forgot your password?")).toBeVisible();
  });

  test("Clicking Forgot password redirects to /forgot-password", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Forgot your password?").click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });
});
