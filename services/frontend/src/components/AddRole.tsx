import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { createRole, updateRole, Role } from "@/utils/roles/helpers";

interface AddRoleDialogProps {
  role?: Role; // if provided, we are editing
  onClose: () => void;
  onSave: (role: Role) => void;
}

const entities = ["users", "exams", "examType", "questions", "statistics"];
const rights = ["view", "create", "edit"];

export default function AddRole({ role, onClose, onSave }: AddRoleDialogProps) {
  const [roleName, setRoleName] = useState(role?.name || "");
  const [permissions, setPermissions] = useState<Record<string, string[]>>(role?.permissions || {});

  useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setPermissions(role.permissions);
    }
  }, [role]);

  const toggleRight = (entity: string, right: string) => {
    setPermissions((prev) => {
      const current = prev[entity] || [];
      if (current.includes(right)) {
        return { ...prev, [entity]: current.filter((r) => r !== right) };
      }
      return { ...prev, [entity]: [...current, right] };
    });
  };

  const toggleAllRights = (entity: string, enabled: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [entity]: enabled ? [...rights] : [],
    }));
  };

  const handleSubmit = async () => {
    if (!roleName.trim()) return;

    const roleData = { name: roleName, permissions };

    let savedRole: Role | null = null;

    if (role?._id) {
      savedRole = await updateRole(role._id, roleData);
    } else {
      savedRole = await createRole(roleData);
    }

    if (savedRole) {
      onSave(savedRole);
      onClose();
      setRoleName("");
      setPermissions({});
    }
  };

  return (
    <Dialog open={!!role || false} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role?._id ? "Edit Role" : "Add a New Role"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Role name"
            maxLength={50}
          />

          {entities.map((entity) => (
            <div key={entity} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <span className="capitalize">{entity}</span>
                <Switch
                  checked={(permissions[entity]?.length ?? 0) > 0}
                  onCheckedChange={(enabled) => toggleAllRights(entity, enabled)}
                />
              </div>
              <div className="flex gap-3 mt-2">
                {rights.map((right) => (
                  <label key={right} className="flex items-center gap-2">
                    <Checkbox
                      checked={permissions[entity]?.includes(right) ?? false}
                      onCheckedChange={() => toggleRight(entity, right)}
                    />
                    {right}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!roleName.trim()}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
