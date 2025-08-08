import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/auth/button";
import { Card, CardContent } from "@/components/ui/auth/card";
import { Input } from "@/components/ui/auth/input";
import { Label } from "@/components/ui/auth/label";
import { useState, useEffect } from "react";
import { login, verify2FA } from "@/utils/auth/helpers";

import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";

import logo_icon_3 from "@/assets/green.png";
import { useNavigate } from "react-router";

import { InputOTPPattern } from "./InputOTP";
import { useAuth } from "@/contexts/AuthProvider";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFATempIDToken, setTwoFATempIDToken] = useState("");

  const [isLoginInvalid, setIsLoginInvalid] = useState(false);
  const [loginFailMessage, setLoginFailMessage] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasAttemptedVerification, setHasAttemptedVerification] =
    useState(false);

  const navigate = useNavigate();
  const { setStatus } = useAuth();

  useEffect(() => {
    if (isLoginInvalid) {
      const timeout = setTimeout(() => {
        setIsLoginInvalid(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isLoginInvalid]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { status, twoFAToken, message } = await login(username, password);
      const is2FARequired = status === "2fa_required";

      if (is2FARequired) {
        setShow2FA(true);
        setTwoFATempIDToken(twoFAToken);
      } else {
        setStatus("authenticated");
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      setIsLoginInvalid(true);
      if (err instanceof Error) {
        setLoginFailMessage(err.message);
      } else {
        setLoginFailMessage("Unknown error");
      }
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    // If first attempt OR cooldown is over and user entered a code
    if (twoFACode.length === 6 && resendCooldown === 0) {
      try {
        setIsVerifying(true);
        await verify2FA(twoFATempIDToken, twoFACode);
        setStatus("authenticated");
        navigate("/dashboard");
      } catch (err) {
        setIsLoginInvalid(true);
        if (err instanceof Error) {
          setLoginFailMessage(err.message);
        } else {
          setLoginFailMessage("Unknown error");
        }

        setHasAttemptedVerification(true);
        setResendCooldown(60);
      } finally {
        setIsVerifying(false);
      }
    }

    else if (hasAttemptedVerification && resendCooldown === 0) {
      try {
        setResendCooldown(60);
        const { twoFAToken: newToken } = await login(username, password);
        setTwoFATempIDToken(newToken);
      } catch {
        alert("Failed to resend 2FA code.");
      }
    }
  };

  const get2FAButtonLabel = () => {
    if (!hasAttemptedVerification) {
      return isVerifying ? "Verifying..." : "Verify";
    }
    return resendCooldown > 0
      ? `Resend Code (${resendCooldown}s)`
      : "Resend Code";
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          {show2FA ? (
            <form onSubmit={handle2FAVerify} className="space-y-4 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-center">
                Enter 2FA Code
              </h2>

              {isLoginInvalid ? (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>{loginFailMessage}</AlertTitle>
                </Alert>
              ) : null}

              <InputOTPPattern
                value={twoFACode}
                onChange={(val) => setTwoFACode(val)}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isVerifying ||
                  (hasAttemptedVerification && resendCooldown > 0)
                }
              >
                {get2FAButtonLabel()}
              </Button>
            </form>
          ) : (
            <form className="p-6 md:p-8" onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome</h1>
                  <p className="text-balance text-muted-foreground">
                    Login to your Examate account
                  </p>
                </div>

                {isLoginInvalid ? (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>{loginFailMessage}</AlertTitle>
                  </Alert>
                ) : null}

                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <span
                      onClick={() => navigate("/forgot-password")}
                      className="ml-auto text-sm underline-offset-2 hover:underline cursor-pointer"
                    >
                      Forgot your password?
                    </span>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          )}
          <div className="flex items-center justify-center h-full w-full">
            <img
              src={logo_icon_3}
              alt="Image"
              className="h-full object-contain dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
