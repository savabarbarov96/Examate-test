import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/auth/button";
import { Card, CardContent } from "@/components/ui/auth/card";
import { Input } from "@/components/ui/auth/input";
import { Label } from "@/components/ui/auth/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";
import { sendResetEmail, verifyCode } from "@/utils/auth/helpers";
import { emailValidation } from "@/utils/auth/validators";
import logo_icon_3 from "@/assets/green.png";
import { InputOTPPattern } from "./InputOTP";

interface ForgotPasswordProps extends React.ComponentProps<"div"> {}

export function ForgotPassword({ className, ...props }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isCodeStage, setIsCodeStage] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setEmailError("");
    setCodeError("");

    if (!isCodeStage) {
      const isValidEmail = emailValidation(email);
      if (!isValidEmail) {
        setEmailError("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      try {
        const res = await sendResetEmail(email);
        setMessage(res.message);
        setIsCodeStage(true);
      } catch (err: unknown) {
        setMessage("Failed to send reset email. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!code || code.length !== 6) {
        setCodeError("Please enter the 6-digit verification code.");
        setLoading(false);
        return;
      }

      try {
        const res = await verifyCode(email, code);
        setMessage(res.message);

        navigate("/change-password", {
          state: { email }
        });
      } catch (error: unknown) {
        
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <p className="text-sm text-muted-foreground">
                  {!isCodeStage
                    ? "Enter your email and we'll send you a reset link"
                    : "Enter the 6-digit code we sent to your email"}
                </p>
              </div>

              {message && (
                <Alert>
                  <CheckCircle2Icon />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {!isCodeStage ? (
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500">{emailError}</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="code">Enter Verification Code</Label>
                  <InputOTPPattern
                    value={code}
                    onChange={(val) => setCode(val)}
                  />
                  {codeError && (
                    <p className="text-xs text-red-500">{codeError}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Processing..."
                  : isCodeStage
                  ? "Continue"
                  : "Send reset link"}
              </Button>
            </div>
          </form>

          <div className="flex items-center justify-center h-full w-full">
            <img
              src={logo_icon_3}
              alt="Illustration"
              className="h-full object-contain dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
