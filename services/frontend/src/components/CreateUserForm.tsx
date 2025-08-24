import { useState } from "react";
import { Button } from "@/components/ui/auth/button";
import { Card, CardContent } from "@/components/ui/auth/card";
import { Input } from "@/components/ui/auth/input";
import { Label } from "@/components/ui/auth/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CreateUserForm() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const roles = ["Admin", "Editor", "Viewer"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !username || !role || !client) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    setError("");
    console.log({ firstName, lastName, email, username, role, client, phone });

    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      navigate("/dashboard");
    }, 3000);
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-semibold text-center mb-5">
            Create New User
          </h2>

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircleIcon />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          {success && (
            <Alert className="mb-5">
              <CheckCircle2 />
              <AlertTitle>User created successfully!</AlertTitle>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="grid gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="firstName" className="text-sm">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="h-10 text-sm"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="lastName" className="text-sm">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="h-10 text-sm"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="username" className="text-sm">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-10 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="role" className="text-sm">
                      Role
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 text-sm justify-between w-full"
                        >
                          {role || "Select Role"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>Select Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {roles.map((r) => (
                          <DropdownMenuItem
                            key={r}
                            onClick={() => setRole(r)}
                          >
                            {r}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="client" className="text-sm">
                      Client
                    </Label>
                    <Input
                      id="client"
                      type="text"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="phone" className="text-sm text-gray-500">
                    Phone <span className="italic">- optional</span>
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-5 gap-3">
              <Button
                type="button"
                variant="secondary"
                className="px-5 py-1.5 text-sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="px-5 py-1.5 text-sm"
                disabled={
                  !firstName || !lastName || !email || !username || !role || !client
                }
              >
                Create User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
