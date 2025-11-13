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

export const predefinedRoles: IRole[] = [
  new RoleModel({
    name: "Sys Admin",
    system: true,
    scope: "system",
    permissions: {
      admin: ["view", "create", "edit"],
      users: ["view", "create", "edit"],
      exams: ["view", "create", "edit"],
      examType: ["view", "create", "edit"],
      questions: ["view", "create", "edit"],
      statistics: ["view", "create", "edit"],
      settings: ["view", "create", "edit"],
      clients: ["view", "create", "edit"],
      customFeatures: ["view", "create", "edit"],
    },
    restrictions: {
      cannotManageSysAdmin: false,
      restrictedModules: [],
    },
  }),
  new RoleModel({
    name: "Client Admin",
    system: true,
    scope: "client",
    permissions: {
      admin: ["view", "create", "edit"],
      users: ["view", "create", "edit"],
      exams: ["view", "create", "edit"],
      examType: ["view", "create", "edit"],
      questions: ["view", "create", "edit"],
      statistics: ["view", "create", "edit"],
      settings: ["view", "create", "edit"],
      clients: ["view", "create", "edit"],
      customFeatures: ["view", "create", "edit"],
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
      users: ["view", "create", "edit"],
      exams: ["view", "create", "edit"],
      examType: ["view", "create", "edit"],
      questions: ["view", "create", "edit"],
      statistics: ["view", "create", "edit"],
      settings: ["view", "create", "edit"],
      clients: ["view", "create", "edit"],
      customFeatures: ["view", "create", "edit"],
    },
    restrictions: {
      cannotManageSysAdmin: false,
      restrictedModules: [],
    },
  }),
];
