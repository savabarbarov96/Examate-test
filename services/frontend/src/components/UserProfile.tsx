"use client";
import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { X, UploadCloud } from "lucide-react";
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

import { getCurrentUser } from "@/utils/users/helpers"; // fetch logged-in user
import { IUser } from "@/utils/users/types";

export default function ProfilePage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [dob, setDob] = useState<Date | undefined>(undefined);

  const today = new Date();
  const minDate = addYears(today, -200);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
        setProfilePreview(data.profilePic || null);
        setDob(data.dob ? new Date(data.dob) : undefined);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        toast.error("Failed to load user info");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

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

    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/png": [".png"], "image/jpeg": [".jpeg", ".jpg"] },
  });

  const handleResetPassword = () => {
    toast("Redirecting to reset password flow...");
    // implement reset password logic
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardContent className="p-6 md:p-8 space-y-6">
          <h1 className="text-2xl font-semibold text-center">My Profile</h1>

          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-full cursor-pointer relative overflow-hidden ${
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
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
                  <button
                    type="button"
                    onClick={() => setProfilePreview(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 text-sm text-center px-2">
                  <UploadCloud size={28} className="mb-1" />
                  {isDragActive ? "Drop here..." : "Drag & drop or click"}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-lg font-medium">{user.username}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>First Name</Label>
              <Input value={user.first_name || ""} readOnly />
            </div>
            <div className="grid gap-1">
              <Label>Last Name</Label>
              <Input value={user.last_name || ""} readOnly />
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
                    disabled={(date) => date > today || date < minDate}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-1">
              <Label>Role</Label>
              <Input value={user.role || ""} readOnly />
            </div>
            <div className="grid gap-1 md:col-span-2">
              <Label>Telephone Number</Label>
              <Input value={user.phone || ""} readOnly />
            </div>
          </div>

          <div className="pt-4">
            <Button variant="destructive" onClick={handleResetPassword}>
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
