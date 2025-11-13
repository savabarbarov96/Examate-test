import User from "../models/User.js";

/**
 * Marks all sessions for users with a specific role as invalid
 * You can implement this by incrementing a `tokenVersion` or setting `forceLogout` flag.
 */
export const invalidateUsersWithRole = async (roleId: string) => {
  await User.updateMany(
    { role: roleId },
    { $set: { forceLogout: true } }
  );
};
