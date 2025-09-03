import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/auth/button";
import { Card, CardContent } from "@/components/ui/auth/card";
import { Input } from "@/components/ui/auth/input";
import { Label } from "@/components/ui/auth/label";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import logo_icon_3 from "@/assets/green.png";
import { changePassword } from "@/utils/auth/helpers";

export function ChangePassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ""; 

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
  if (!email) {
    navigate("/", { replace: true });
  }
}, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await changePassword(email, newPassword);
      setSuccess(res.message || "Password changed successfully.");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    }
  };

  return (
    <div className="flex flex-col gap-6" {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="text-balance text-muted-foreground">
                  Set a new password for your account.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle2Icon className="text-green-500" />
                  <AlertTitle>{success}</AlertTitle>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                Submit
              </Button>
            </div>
          </form>

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
        By resetting your password, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
