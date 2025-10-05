import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.cookies.jwt;

    console.log({ token });
    
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.changePasswordAfter(decoded.iat)) {
      return res.status(401).json({ message: "Password recently changed" });
    }

    // @ts-ignore
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

