import { RoleModel } from "../models/Role.js";
import { invalidateUsersWithRole } from "../utils/forceLogout.js";
export const createRole = async (req, res, next) => {
    try {
        const { name, system, scope, permissions, restrictions } = req.body;
        const existing = await RoleModel.findOne({ name });
        if (existing)
            return res.status(400).json({ message: "Role already exists" });
        const role = await RoleModel.create({ name, system, scope, permissions, restrictions });
        return res.status(201).json({ message: "Role created", role });
    }
    catch (err) {
        next(err);
    }
};
export const updateRole = async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const { name, permissions, restrictions } = req.body;
        const role = await RoleModel.findById(roleId);
        if (!role)
            return res.status(404).json({ message: "Role not found" });
        role.name = name ?? role.name;
        role.permissions = permissions ?? role.permissions;
        role.restrictions = restrictions ?? role.restrictions;
        await role.save();
        await invalidateUsersWithRole(role._id);
        return res.status(200).json({ message: "Role updated", role });
    }
    catch (err) {
        next(err);
    }
};
export const getRoles = async (req, res, next) => {
    try {
        const roles = await RoleModel.find().sort({ createdAt: -1 });
        return res.status(200).json({ roles });
    }
    catch (err) {
        next(err);
    }
};
export const deleteRole = async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const role = await RoleModel.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        if (role.system) {
            return res.status(403).json({ message: "Cannot delete system role" });
        }
        await role.deleteOne();
        return res.status(200).json({ message: "Role deleted" });
    }
    catch (err) {
        next(err);
    }
};
