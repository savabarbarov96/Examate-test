import crypto from "crypto";
import User from "../models/User.js";
// GET all users (requires "view" permission)
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .select("first_name last_name email status createdAt username ") // Add role
            // .populate("role", "name permissions")
            .lean();
        res.status(200).json({
            status: "success",
            results: users.length,
            data: users,
        });
    }
    catch (err) {
        next(err);
    }
};
// GET single user (requires "view" permission)
export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select("first_name last_name email status createdAt username role")
            .populate("role", "name permissions");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({ status: "success", data: user });
    }
    catch (err) {
        next(err);
    }
};
// CREATE user (requires "create" permission)
export const createUser = async (req, res, next) => {
    try {
        const { email, username, role, firstName, lastName, client, phone } = req.body;
        const tempPassword = crypto.randomBytes(12).toString("base64url");
        const user = await User.create({
            email,
            username,
            role,
            firstName,
            lastName,
            client,
            phone,
            password: tempPassword,
            passwordConfirm: tempPassword,
        });
        res.status(201).json({ status: "success", data: user });
    }
    catch (err) {
        next(err);
    }
};
// UPDATE user (requires "update" permission)
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = await User.findByIdAndUpdate(id, updates, { new: true });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({ status: "success", data: user });
    }
    catch (err) {
        next(err);
    }
};
// DELETE user (requires "delete" permission)
export const deleteUser = async (req, res, next) => {
    // try {
    //   const { id } = req.params;
    //   const user = await User.findById(id);
    //   if (!user) return res.status(404).json({ message: "User not found" });
    //   // Prevent deleting admins if restricted
    //   const role = await RoleModel.findById(user.role);
    //   if (role?.restrictions?.cannotManageSysAdmin) {
    //     return res.status(403).json({ message: "Cannot delete admin users" });
    //   }
    //   await user.deleteOne();
    //   res.status(200).json({ status: "success", message: "User deleted" });
    // } catch (err) {
    //   next(err);
    // }
};
