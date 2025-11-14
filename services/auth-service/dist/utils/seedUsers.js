import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { RoleModel, predefinedRoles } from "../models/Role.js";
const MONGO_URI = process.env.MONGO_URI || "mongodb://root:examate_mongo_pass@localhost:27017/examate?authSource=admin";
// Test users to seed
const testUsers = [
    {
        firstName: "Ivan",
        lastName: "Popov",
        email: "ipopov@example.com",
        username: "ipopov",
        password: "12345678",
        client: "test-client",
        phone: "+1234567890",
    },
    {
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        username: "admin",
        password: "admin123456",
        client: "test-client",
        phone: "+0987654321",
    },
];
export async function initializeUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✓ MongoDB connected");
        // 1. Seed roles first
        const roleCount = await RoleModel.countDocuments();
        if (roleCount === 0) {
            console.log("Seeding predefined roles...");
            for (const role of predefinedRoles) {
                await RoleModel.create(role);
                console.log(`✓ Seeded role: ${role.name}`);
            }
        }
        else {
            console.log(`✓ Roles already exist (${roleCount} roles found)`);
        }
        // 2. Get the "Sys Admin" role
        const sysAdminRole = await RoleModel.findOne({ name: "Sys Admin" });
        if (!sysAdminRole) {
            throw new Error("Sys Admin role not found. Please seed roles first.");
        }
        // 3. Seed test users
        console.log("\nSeeding test users...");
        for (const userData of testUsers) {
            const userExists = await User.findOne({
                $or: [{ email: userData.email }, { username: userData.username }],
            });
            if (userExists) {
                console.log(`⚠ User already exists: ${userData.username}`);
                continue;
            }
            // Hash password
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            // Create user
            const user = await User.create({
                ...userData,
                password: hashedPassword,
                passwordConfirm: hashedPassword,
                role: sysAdminRole._id,
                status: "active",
                accountLocked: false,
                isLocked: false,
                firstLogin: true,
                failedLoginAttempts: 0,
                failed2FAAttempts: 0,
                twoFactorEnabled: false,
            });
            console.log(`✓ Seeded user: ${userData.username} (password: ${userData.password})`);
        }
        console.log("\n✓ User seeding completed successfully!");
    }
    catch (err) {
        console.error("Error initializing users:", err);
        process.exit(1);
    }
    finally {
        await mongoose.disconnect();
    }
}
// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeUsers();
}
export default initializeUsers;
