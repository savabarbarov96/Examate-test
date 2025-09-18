import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckIcon, XIcon, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import AddRoleDialog from "@/components/AddRole";
import {
  getAllRoles,
  deleteRole,
  updateRole,
  Role,
} from "@/utils/roles/helpers";

const modules = [
  "admin",
  "users",
  "exams",
  "examType",
  "questions",
  "statistics",
];
const moduleOperations: Record<string, ("view" | "create" | "edit")[]> = {
  admin: ["view", "create", "edit"],
  users: ["view", "create", "edit"],
  exams: ["view", "create", "edit"],
  examType: ["view", "create", "edit"],
  questions: ["view", "create", "edit"],
  statistics: ["view", "create", "edit"],
};

export default function UserRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const fetchRoles = async () => {
    const data = await getAllRoles();
    if (data) setRoles(data);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Close actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".actions-cell")) {
        setActiveRowId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;

    const success = await deleteRole(roleToDelete._id);
    if (success) {
      setRoles((prev) => prev.filter((r) => r._id !== roleToDelete._id));
      toast(`Role "${roleToDelete.name}" deleted.`, {
        description: "The role has been successfully removed.",
      });
    }
    setRoleToDelete(null);
  };

  const handleEditRole = (role: Role) => {
    setActiveRowId(null);
    setRoleToEdit(role);
  };

  const handleSaveRole = (updatedRole: Role) => {
    setRoles((prev) =>
      prev.map((r) => (r._id === updatedRole._id ? updatedRole : r))
    );
    setRoleToEdit(null);
    toast(`Role "${updatedRole.name}" updated.`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">User Roles</h1>
        <AddRoleDialog
          onClose={() => {}}
          onSave={(role) => setRoles((prev) => [...prev, role])}
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              {modules.map((module) => (
                <TableHead key={module} className="text-center capitalize">
                  {module === "examType" ? "Exam Type" : module}
                </TableHead>
              ))}
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {roles.map((role) => (
              <TableRow key={role._id}>
                <TableCell className="font-medium">{role.name}</TableCell>

                {modules.map((module) => (
                  <TableCell key={module} className="text-center">
                    <div
                      className="grid gap-1 justify-items-center"
                      style={{
                        gridTemplateColumns: `repeat(${moduleOperations[module].length}, minmax(0, 1fr))`,
                      }}
                    >
                      {moduleOperations[module].map((op) =>
                        role.permissions[module]?.includes(op) ? (
                          <CheckIcon
                            key={op}
                            className="w-4 h-4 text-green-500"
                          />
                        ) : (
                          <XIcon key={op} className="w-4 h-4 text-red-400" />
                        )
                      )}
                    </div>
                  </TableCell>
                ))}

                <TableCell className="text-center actions-cell relative">
                  {activeRowId === role._id ? (
                    <div
                      className="flex gap-2 justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => setRoleToDelete(role)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRole(role)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRowId(role._id);
                      }}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {roleToDelete && (
        <AlertDialog
          open={!!roleToDelete}
          onOpenChange={() => setRoleToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the role "{roleToDelete.name}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteRole}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {roleToEdit && (
        <AddRoleDialog
          role={roleToEdit}
          onClose={() => setRoleToEdit(null)}
          onSave={handleSaveRole}
        />
      )}
    </div>
  );
}
