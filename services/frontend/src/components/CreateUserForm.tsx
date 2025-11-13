import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { addYears } from "date-fns";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/auth/button";
import { Card, CardContent } from "@/components/ui/auth/card";
import { Input } from "@/components/ui/auth/input";
import { Label } from "@/components/ui/auth/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { getAllRoles, Role } from "@/utils/roles/helpers";
import { createUser } from "@/utils/users/helpers";

export function CreateUserForm() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);

  const namePattern = /^[A-Za-z0-9 .'-]{1,30}$/;
  const phonePattern = /^[0-9]*$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const today = new Date();
  const minDate = addYears(today, -200); // 200 years ago

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getAllRoles();
        setRoles(data ?? []);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };
    fetchRoles();
  }, []);

  // --- Dropzone for Profile Picture ---
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    const f = acceptedFiles[0];

    if (!["image/png", "image/jpeg"].includes(f.type)) {
      toast.error("Only .png or .jpeg files are allowed.");
      return;
    }

    if (f.size > 2 * 1024 * 1024) {
      toast.error("File size must not exceed 2MB.");
      return;
    }

    setProfilePic(f);
    setLoadingProfile(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result as string);
      setTimeout(() => setLoadingProfile(false), 500); // dummy loading
    };
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/png": [".png"], "image/jpeg": [".jpeg", ".jpg"] },
  });

  const handleRemoveProfile = () => {
    setProfilePic(null);
    setProfilePreview(null);
  };

  const validateFields = (): boolean => {
    if (!firstName || !lastName || !email || !username || !role || !client) {
      toast.error("Please fill in all mandatory fields.");
      return false;
    }
    if (!namePattern.test(firstName) || !namePattern.test(lastName))
      return false;
    if (!emailPattern.test(email)) return false;
    if (phone && !phonePattern.test(phone)) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    setSuccess(true);

    try {
      const formData = new FormData();

      formData.append("email", email);
      formData.append("username", username);
      formData.append("role", role);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("client", client);

      if (phone) formData.append("phone", phone);
      if (dob) formData.append("dob", dob.toISOString());
      if (profilePic) formData.append("profilePic", profilePic);
      
      const newUser = await createUser(formData);

      if (!newUser) {
        toast.error("Failed to create user.");
        setSuccess(false);
        return;
      }

      toast.success("User created successfully!");
      setTimeout(() => navigate("/all-users"), 2000);
    } catch (error) {
      console.error("Create user error:", error);
      toast.error("Something went wrong creating the user.");
      setSuccess(false);
    }
  };

  const handleCancel = () => navigate("/all-users");

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-semibold text-center mb-5">
            Create New User
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column */}
              <div className="grid gap-3">
                {/* Profile Picture Dropzone */}
                <div className="grid gap-1">
                  <Label className="text-sm">
                    Profile Picture <span className="italic">- optional</span>
                  </Label>
                  <div
                    {...getRootProps()}
                    className={`flex flex-col items-center justify-center w-36 h-36 border-2 border-dashed rounded-full cursor-pointer transition hover:border-blue-400 relative overflow-hidden ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input {...getInputProps()} disabled={success} />
                    {profilePreview ? (
                      <>
                        <img
                          src={profilePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        {loadingProfile && (
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white font-semibold text-sm">
                            Loading...
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveProfile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 text-sm text-center px-2">
                        <UploadCloud size={32} className="mb-1" />
                        {isDragActive ? "Drop here..." : "Drag & drop or click"}
                      </div>
                    )}
                  </div>
                </div>

                {/* First Name */}
                <div className="grid gap-1">
                  <Label htmlFor="firstName" className="text-sm">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    maxLength={30}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="h-10 text-sm"
                    disabled={success}
                  />
                </div>

                {/* Last Name */}
                <div className="grid gap-1">
                  <Label htmlFor="lastName" className="text-sm">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    maxLength={30}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="h-10 text-sm"
                    disabled={success}
                  />
                </div>

                {/* Email */}
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
                    disabled={success}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="grid gap-3">
                {/* Username */}
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
                    disabled={success}
                  />
                </div>

                {/* Role + Client */}
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
                          disabled={success}
                        >
                          {roles.find((r) => r._id === role)?.name ||
                            "Select Role"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>Select Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {roles.map((r) => (
                          <DropdownMenuItem
                            key={r._id}
                            onClick={() => setRole(r._id)}
                          >
                            {r.name}
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
                      disabled={success}
                    />
                  </div>
                </div>

                {/* Phone (optional) */}
                <div className="grid gap-1">
                  <Label htmlFor="phone" className="text-sm text-gray-500">
                    Phone <span className="italic">- optional</span>
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9]*$/.test(value)) setPhone(value);
                      else
                        toast.error(
                          "Phone number can contain only numeric characters (0-9)."
                        );
                    }}
                    className="h-10 text-sm"
                    disabled={success}
                  />
                </div>

                {/* Date of Birth (optional) */}
                <div className="grid gap-1">
                  <Label htmlFor="dob" className="text-sm text-gray-500">
                    Date of Birth <span className="italic">- optional</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {dob ? dob.toLocaleDateString() : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dob}
                        captionLayout="dropdown"
                        onSelect={setDob}
                        disabled={(date) => date > today || date < minDate}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-5 gap-3">
              <Button
                type="button"
                variant="secondary"
                className="px-5 py-1.5 text-sm"
                onClick={handleCancel}
                disabled={success}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-5 py-1.5 text-sm"
                disabled={success}
              >
                {success ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
