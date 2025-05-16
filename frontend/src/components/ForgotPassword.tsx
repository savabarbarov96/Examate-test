import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/auth/button";
import { Card, CardContent } from "@/components/ui/auth/card";
import { Input } from "@/components/ui/auth/input";
import { Label } from "@/components/ui/auth/label";
import { useState } from "react";
import { sendResetEmail } from "@/utils/auth/helpers";

import logo_icon_3 from "@/assets/green.png";
import { useNavigate } from "react-router";
export function ForgotPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await sendResetEmail(email);
      setMessage("If your email is correct, you’ll receive a reset link shortly.");
    } catch (err) {
      setMessage("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a reset link
                </p>
              </div>
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
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>

              {/* {message && (
                <p className="text-sm text-center text-muted-foreground">
                  {message}
                </p>
              )} */}
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
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
