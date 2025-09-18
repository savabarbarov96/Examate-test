import mongoose, { Schema } from "mongoose";
const roleSchema = new Schema({
    name: { type: String, required: true, unique: true },
    system: { type: Boolean, default: false },
    scope: { type: String, enum: ["system", "client"], required: true },
    permissions: { type: Map, of: [String], required: true },
    restrictions: {
        cannotManageSysAdmin: { type: Boolean, default: false },
        restrictedModules: { type: [String], default: [] },
    },
}, { timestamps: true });
export const RoleModel = mongoose.model("Role", roleSchema);
export const predefinedRoles = [
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
