import User from "../models/User.js";
export const checkPermission = (entity, operation) => {
    return async (req, res, next) => {
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await User.findById(userId).populate("role");
        if (!user || !user.role)
            return res.status(403).json({ message: "No role assigned" });
        const role = user.role;
        const allowedRights = role.permissions?.[entity] || [];
        if (!allowedRights.includes(operation)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};
