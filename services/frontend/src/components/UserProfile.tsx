import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { X, UploadCloud, ArrowLeft } from "lucide-react";
import { addYears } from "date-fns";

import { Card, CardContent } from "@/components/ui/auth/card";
import { Input } from "@/components/ui/auth/input";
import { Label } from "@/components/ui/auth/label";
import { Button } from "@/components/ui/auth/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getCurrentUser, getUserById, updateUser } from "@/utils/users/helpers";
import { GetUserPayload, UpdateUserPayload } from "@/utils/users/types";
import { getAllRoles, Role } from "@/utils/roles/helpers";

export default function ProfilePage() {
  const [originalUser, setOriginalUser] = useState<GetUserPayload | null>(null);
  const [user, setUser] = useState<GetUserPayload | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [role, setRole] = useState<string>("");

  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const today = new Date();
  const minDate = addYears(today, -200);

  const isEditing = Boolean(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user (either by ID or current)
        const data = id ? await getUserById(id) : await getCurrentUser();
        const userData = data as GetUserPayload;

        setOriginalUser(userData);
        setUser(userData);
        setProfilePreview(userData.profilePic || null);
        setDob(userData.dob ? new Date(userData.dob) : undefined);

        // Fetch roles
        const rolesData = await getAllRoles();
        setRoles(rolesData ?? []);

        const currentRole = rolesData?.find(
          (r) => r.name === userData.role.name
        );

        if (!currentRole) {
          setRole(
            userData.role.name === "Sys Admin" ? "Sys Admin" : "Client Admin"
          );
        } else {
          setRole(currentRole?.name || "");
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error("Failed to load profile info");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

    setProfileFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/png": [".png"], "image/jpeg": [".jpeg", ".jpg"] },
  });

  const handleChange = (key: keyof UpdateUserPayload, value: string) => {
    if (!user) return;
    setUser({ ...user, [key]: value });
  };

  const handleSubmit = async () => {
    if (!user || !originalUser) return;
    setSaving(true);

    try {
      const formData = new FormData();

      if (user.firstName !== originalUser.firstName)
        formData.append("firstName", user.firstName || "");
      if (user.lastName !== originalUser.lastName)
        formData.append("lastName", user.lastName || "");
      if (user.username !== originalUser.username)
        formData.append("username", user.username || "");
      if (user.email !== originalUser.email)
        formData.append("email", user.email || "");
      if (user.phone !== originalUser.phone && user.phone)
        formData.append("phone", user.phone);
      if (
        dob &&
        (!originalUser.dob ||
          dob.toISOString() !== new Date(originalUser.dob).toISOString())
      )
        formData.append("dob", dob.toISOString());
      // if (role && role !== originalUser.role) formData.append("role", role);

      // Compare profile file only if changed
      if (profileFile && profilePreview !== originalUser.profilePic)
        formData.append("profilePic", profileFile);

      if ([...formData.entries()].length === 0) {
        toast.error("No changes to save");
        return;
      }

      await updateUser(user._id, formData);
      toast.success("User updated successfully");
      navigate("/all-users");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = () => {
    toast.success("An email with password reset instructions has been sent.");
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Back Button */}
          <div className="flex justify-start mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </div>

          <h1 className="text-2xl font-semibold text-center">
            {isEditing ? `Editing ${user.username}` : "My Profile"}
          </h1>

          {/* Account Info */}
          <div className="space-y-5">
            <h2 className="text-lg font-semibold border-b pb-1">
              Account Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Profile Picture */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div
                  {...getRootProps()}
                  className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-full cursor-pointer relative overflow-hidden ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <input {...getInputProps()} />
                  {profilePreview ? (
                    <>
                      <img
                        src={profilePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setProfilePreview(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 text-sm text-center px-2">
                      <UploadCloud size={28} className="mb-1" />
                      {isDragActive ? "Drop here..." : "Upload or drag image"}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Username & Email */}
              <div className="grid gap-1">
                <Label>Username</Label>
                <Input
                  value={user.username || ""}
                  onChange={(e) => handleChange("username", e.target.value)}
                />
                <Label>Email</Label>
                <Input
                  value={user.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-1">
              Personal Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label>First Name</Label>
                <Input
                  value={user.firstName || ""}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label>Last Name</Label>
                <Input
                  value={user.lastName || ""}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label>Date of Birth</Label>
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
                      onSelect={setDob}
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      disabled={(date) => date > today || date < minDate}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Role Dropdown */}
              <div className="grid gap-1">
                <Label>Role</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      { role || "Select Role"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
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
                <Label>Telephone Number</Label>
                <Input
                  value={user.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-center items-center gap-3">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="destructive" onClick={handleResetPassword}>
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
