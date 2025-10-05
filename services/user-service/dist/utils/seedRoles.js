import { RoleModel, predefinedRoles } from "../models/Role.js";
export async function initializeRoles() {
    try {
        const collections = await RoleModel.db.listCollections();
        const roleCollectionExists = collections.some((col) => col.name === RoleModel.collection.name);
        if (!roleCollectionExists) {
            console.log("Roles collection not found. Seeding predefined roles...");
            for (const role of predefinedRoles) {
                await role.save();
                console.log(`Seeded role: ${role.name}`);
            }
            console.log("Roles seeding completed.");
        }
        else {
            console.log("Roles collection already exists. Skipping seeding.");
        }
    }
    catch (err) {
        console.error("Error initializing roles:", err);
    }
}
