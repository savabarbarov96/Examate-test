import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { RoleModel } from "../models/Role.js";

export const checkPermission = (entity: string, operation: "view" | "create" | "update" | "delete") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id; 
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).populate("role");
    if (!user || !user.role) return res.status(403).json({ message: "No role assigned" });

    const role = user.role as any;
    const allowedRights = role.permissions?.[entity] || [];

    if (!allowedRights.includes(operation)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
