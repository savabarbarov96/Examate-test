import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createRole, updateRole, Role } from "@/utils/roles/helpers";

interface AddRoleDialogProps {
  role?: Role;
  open: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
}

const entities = ["users", "exams", "examType", "questions", "statistics"];
const rights = ["view", "create", "edit"];

export default function AddRoleDialog({
  role,
  open,
  onClose,
  onSave,
}: AddRoleDialogProps) {
  const [roleName, setRoleName] = useState(role?.name || "");
  const [permissions, setPermissions] = useState<Record<string, string[]>>(
    role?.permissions || {}
  );
  const [nameAlert, setNameAlert] = useState(false);

  useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setPermissions(role.permissions);
    } else {
      setRoleName("");
      setPermissions({});
    }
  }, [role]);

  useEffect(() => {
    setNameAlert(roleName.length >= 50);
  }, [roleName]);

  const toggleRight = (entity: string, right: string) => {
    setPermissions((prev) => {
      const current = prev[entity] || [];
      let updated = [...current];

      if (current.includes(right)) {

        updated = updated.filter((r) => r !== right);

        if (right === "view") {
          updated = updated.filter((r) => r !== "edit");
        }
      } else {
        updated.push(right);

        if (right === "edit" && !updated.includes("view")) {
          updated.push("view");
        }
      }

      return { ...prev, [entity]: updated };
    });
  };

  const toggleAllRights = (entity: string, enabled: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [entity]: enabled ? [...rights] : [],
    }));
  };

  const handleStatisticsToggle = (enabled: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      statistics: enabled ? ["view", "create", "edit"] : [],
    }));
  };

  const handleSubmit = async () => {
    if (!roleName.trim() || nameAlert) return;

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
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {role?._id ? "Edit Role" : "Add a New Role"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Role name"
            maxLength={50}
          />
          {nameAlert && (
            <Alert variant="destructive">
              <AlertDescription>
                Role name should not be longer than 50 characters.
              </AlertDescription>
            </Alert>
          )}

          {entities.map((entity) => {
            const entityRights = permissions[entity] || [];
            const isEnabled = entityRights.length > 0;

            if (entity === "statistics") {
              return (
                <div key={entity} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{entity}</span>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        handleStatisticsToggle(!!checked)
                      }
                    />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          handleStatisticsToggle(!!checked)
                        }
                      />
                      Enable
                    </label>
                  </div>
                </div>
              );
            }

            return (
              <div key={entity} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="capitalize">{entity}</span>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(enabled) =>
                      toggleAllRights(entity, enabled)
                    }
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  {rights.map((right) => (
                    <label key={right} className="flex items-center gap-2">
                      <Checkbox
                        checked={entityRights.includes(right)}
                        onCheckedChange={() => toggleRight(entity, right)}
                      />
                      {right}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!roleName.trim() || nameAlert}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
