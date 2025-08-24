import { CheckIcon, XIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Permission = {
  admin: string[];
  users: string[];
  exams: string[];
  examType: string[];
  questions: string[];
  statistics: string[];
};

type Role = {
  name: string;
  permissions: Permission;
};

// Hardcoded roles
const roles: Role[] = [
  {
    name: "Super Admin",
    permissions: {
      admin: ["view", "create", "update", "delete"],
      users: ["view", "create", "update", "delete"],
      exams: ["view", "create", "update", "delete"],
      examType: ["view", "create", "update", "delete"],
      questions: ["view", "create", "update", "delete"],
      statistics: ["view", "create", "update", "delete"],
    },
  },
  {
    name: "Exam Manager",
    permissions: {
      admin: ["view"],
      users: ["view", "create"],
      exams: ["view", "create", "update"],
      examType: ["view", "create", "update"],
      questions: ["view", "create", "update"],
      statistics: ["view"],
    },
  },
  {
    name: "Viewer",
    permissions: {
      admin: ["view"],
      users: ["view"],
      exams: ["view"],
      examType: ["view"],
      questions: ["view"],
      statistics: ["view"],
    },
  },
];

const modules = ["admin", "users", "exams", "examType", "questions", "statistics"];
const operations: ("view" | "create" | "update" | "delete")[] = ["view", "create", "update", "delete"];

export function UserRoles() {
  return (
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
          </TableRow>
        </TableHeader>

        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.name}>
              <TableCell className="font-medium">{role.name}</TableCell>
              {modules.map((module) => (
                <TableCell key={module} className="text-center">
                  <div className="grid grid-cols-4 gap-1 justify-items-center">
                    {operations.map((op) =>
                      role.permissions[module as keyof Permission].includes(op) ? (
                        <CheckIcon key={op} className="w-4 h-4 text-green-500" />
                      ) : (
                        <XIcon key={op} className="w-4 h-4 text-red-400" />
                      )
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
