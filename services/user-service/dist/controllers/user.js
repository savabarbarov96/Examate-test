import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";
// GET all users (requires "view" permission)
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .select("firstName lastName email status createdAt username")
            // .populate(
            //   "role"
            //   // , "name permissions"
            // )
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
            .select("firstName lastName email username role phone dob profilePic")
            .populate("role"
        // "name permissions"
        );
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({ status: "success", data: user });
    }
    catch (err) {
        next(err);
    }
};
// GET currently authenticated user
export const getCurrentUser = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const user = await User.findById(userId)
            .select("firstName lastName email username role phone dob profilePic")
            .populate("role");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ status: "success", data: user });
    }
    catch (err) {
        next(err);
    }
};
// CREATE user (requires "create" permission)
export const createUser = async (req, res, next) => {
    try {
        const { email, username, role, firstName, lastName, client, phone, dob } = req.body;
        const profilePicFile = req.file;
        let profilePicBase64 = "";
        if (profilePicFile) {
            const mimeType = profilePicFile.mimetype;
            const buffer = profilePicFile.buffer;
            if (!["image/png", "image/jpeg"].includes(mimeType)) {
                return res.status(400).json({ message: "Invalid profilePic format" });
            }
            if (buffer.length > 2 * 1024 * 1024) {
                return res.status(400).json({ message: "Profile picture too large" });
            }
            profilePicBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
        }
        const tempPassword = crypto.randomBytes(12).toString("base64url");
        const token = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const tokenExpires = Date.now() + 12 * 60 * 60 * 1000;
        const user = await User.create({
            email,
            username,
            role,
            firstName,
            lastName,
            client,
            phone,
            dob,
            profilePic: profilePicBase64,
            password: tempPassword,
            passwordConfirm: tempPassword,
            verificationToken: hashedToken,
            verificationExpires: tokenExpires,
        });
        const activationLink = `${process.env.CLIENT_ORIGIN}/activate/${token}`;
        await sendEmail({
            to: email,
            subject: "Activate your account",
            html: `
        <h2>Welcome, ${firstName}!</h2>
        <p>Your username: <b>${username}</b></p>
        <p>Click below to activate your account:</p>
        <a href="${activationLink}" target="_blank">${activationLink}</a>
        <p>This link is valid for 12 hours.</p>
      `,
        });
        res.status(201).json({
            status: "success",
            message: "User created and verification email sent.",
            data: user,
        });
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
        const profilePicFile = req.file;
        // console.log({ id, updates, profilePicFile });
        let profilePicBase64;
        if (profilePicFile) {
            const mimeType = profilePicFile.mimetype;
            const buffer = profilePicFile.buffer;
            if (!["image/png", "image/jpeg"].includes(mimeType)) {
                return res
                    .status(400)
                    .json({ message: "Invalid profile picture format" });
            }
            if (buffer.length > 2 * 1024 * 1024) {
                return res.status(400).json({ message: "Profile picture too large" });
            }
            profilePicBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
            updates.profilePic = profilePicBase64;
        }
        const user = await User.findByIdAndUpdate(id, updates, {
            new: true,
        });
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
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        console.log({ id });
        // Prevent deleting admins if restricted
        // const role = await RoleModel.findById(user.role);
        // if (role?.restrictions?.cannotManageSysAdmin) {
        //   return res.status(403).json({ message: "Cannot delete admin users" });
        // }
        await user.deleteOne();
        res.status(200).json({ status: "success", message: "User deleted" });
    }
    catch (err) {
        next(err);
    }
};
