import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  system: boolean;
  scope: "system" | "client";
  permissions: Record<string, string[]>;
  restrictions?: {
    cannotManageSysAdmin?: boolean;
    restrictedModules?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    system: { type: Boolean, default: false },
    scope: { type: String, enum: ["system", "client"], required: true },
    permissions: { type: Map, of: [String], required: true },
    restrictions: {
      cannotManageSysAdmin: { type: Boolean, default: false },
      restrictedModules: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

export const RoleModel = mongoose.model<IRole>("Role", roleSchema);

// Predefined roles
export const predefinedRoles: IRole[] = [
  new RoleModel({
    name: "Sys Admin",
    system: true,
    scope: "system",
    permissions: {
      admin: ["view", "create", "update", "delete"],
      users: ["view", "create", "update", "delete"],
      exams: ["view", "create", "update", "delete"],
      examType: ["view", "create", "update", "delete"],
      questions: ["view", "create", "update", "delete"],
      statistics: ["view", "create", "update", "delete"],
      settings: ["view", "create", "update", "delete"],
      clients: ["view", "create", "update", "delete"],
      customFeatures: ["view", "create", "update", "delete"],
    },
    restrictions: {},
  }),
  new RoleModel({
    name: "Client Admin",
    system: true,
    scope: "client",
    permissions: {
      admin: ["view"],
      users: ["view", "create", "update", "delete"],
      exams: ["view", "create", "update", "delete"],
      examType: ["view", "create", "update", "delete"],
      questions: ["view", "create", "update", "delete"],
      statistics: ["view", "create", "update", "delete"],
      settings: ["view", "update"],
      clients: [],
      customFeatures: [],
    },
    restrictions: {
      cannotManageSysAdmin: true,
      restrictedModules: ["clients", "customFeatures"],
    },
  }),
  new RoleModel({
    name: "Proctor",
    system: true,
    scope: "client",
    permissions: {
      admin: [],
      users: ["view"],
      exams: ["view"],
      examType: ["view"],
      questions: ["view"],
      statistics: ["view"],
      settings: [],
      clients: [],
      customFeatures: [],
    },
    restrictions: {},
  }),
];
