import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import * as crypto from "crypto";
import { UAParser } from "ua-parser-js";

import User, { IUser } from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import { HydratedDocument } from "mongoose";
import { createSession, terminateSession } from "../utils/session.js";
import { geoReader } from "../utils/geo.js";
import { recordLoginAttempt } from "../utils/logger.js";

const isProduction = process.env.NODE_ENV === "production";

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
    // process.env.JWT_EXPIRES_IN,
  });
};

const sign2FAToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });
};

export const promisifyJWTVerification = (
  token: string,
  secret: string
): Promise<JwtPayload | string> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as JwtPayload);
    });
  });
};

const createAndSendTokens = (user: HydratedDocument<IUser>, res: Response) => {
  const accessToken = signToken(user._id.toString());

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "8h",
    }
  );

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 8 * 24 * 60 * 60 * 1000,
  });

  user.password = undefined!;
  res.status(200).json({
    status: "success",
    user,
  });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const ipHeader = req.headers["x-forwarded-for"] || req.ip;
    const ip = Array.isArray(ipHeader) ? ipHeader[0] : ipHeader || req.ip;
    const ipString = ip ?? "127.0.0.1";

    const userAgent = req.headers["user-agent"] || "";
    const { browser, cpu, device, os } = UAParser(userAgent);

    let geoData: any = null;

    try {
      geoData = geoReader.city(ipString);
    } catch (err: any) {
      if (err.name === "AddressNotFoundError") {
        console.warn(`Geo lookup failed for IP: ${ip}`);
      }
    }
  
    const { username, password } = req.body;

    if (!username || !password) {
      await recordLoginAttempt({
        username,
        ip: ipString,
        device: { browser, cpu, device, os },
        status: "failed",
        message: "Missing username or password",
      });

      return res
        .status(400)
        .json({ message: "Please provide username and password!" });
    }

    const user = await User.findOne({ username }).select(
      "+password +twoFactorCode +twoFactorCodeExpires +twoFactorEnabled +status +isLocked +lockUntil"
    );

    if (!user) {
      await recordLoginAttempt({
        username,
        ip: ipString,
        device: { browser, cpu, device, os },
        status: "failed",
        message: "Invalid username",
      });
      return res.status(401).json({ message: "Invalid username" });
    }

    const now = new Date();

    if (user?.isLocked && user.lockUntil && user.lockUntil <= now) {
      user.isLocked = false;
      user.lockUntil = undefined;
      user.failedLoginAttempts = 0;
      await user.save({ validateBeforeSave: false });

      console.log(
        `User ${user.username} unlocked automatically after lock expired.`
      );
    }
    
    if (user?.isLocked) {
      await recordLoginAttempt({
        userId: user._id.toString(),
        username: user.username,
        ip: ipString,
        device: { browser, cpu, device, os },
        status: "locked",
        message: "Account is locked",
      });

      return res.status(403).json({
        status: "locked",
        message:
          "Your account access has been restricted. Please contact your organization’s admin.",
      });
    }

    const isPasswordValid =
      user && (await bcrypt.compare(password, user.password!));

    if (!isPasswordValid) {
      if (
        user.lastFailedLoginAttempt &&
        now.getTime() - user.lastFailedLoginAttempt.getTime() <= 60 * 1000
      ) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      } else {
        user.failedLoginAttempts = 1;
      }

      user.lastFailedLoginAttempt = now;

      if (user.failedLoginAttempts > 5) {
        user.isLocked = true;
        user.lockUntil = new Date(now.getTime() + 15 * 60 * 1000);

        await user.save({ validateBeforeSave: false });

        await recordLoginAttempt({
          userId: user._id.toString(),
          username: user.username,
          ip: ipString,
          device: { browser, cpu, device, os },
          status: "locked",
          message: "Account locked due to too many failed login attempts",
        });

        return res.status(403).json({
          status: "locked",
          message:
            "Your account access has been restricted. Please contact your organization’s admin.",
        });
      }

      await user.save({ validateBeforeSave: false });

      await recordLoginAttempt({
        userId: user._id.toString(),
        username: user.username,
        ip: ipString,
        device: { browser, cpu, device, os },
        status: "failed",
        message: "Invalid credentials",
      });

      console.log("Invalid credentials.");
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (user.failedLoginAttempts && user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lastFailedLoginAttempt = undefined;
      user.lockUntil = undefined;
      user.isLocked = false;
      await user.save({ validateBeforeSave: false });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ message: "JWT secret is not configured in the environment." });
    }

    if (user.status === "unverified") {
      await recordLoginAttempt({
        userId: user._id.toString(),
        username: user.username,
        ip: ipString,
        device: { browser, cpu, device, os },
        status: "unverified",
        message: "User account is unverified",
      });

      console.log("Unverified account login attempt");

      return res.status(403).json({
        status: "unverified",
        message:
          "Unverified account. Please complete the verification process or contact your administrator.",
      });
    }

    await recordLoginAttempt({
      userId: user._id.toString(),
      username: user.username,
      ip: ipString,
      device: { browser, cpu, device, os },
      geo: geoData,
      status: "success",
      message: "Login successful",
    });

    if (!user.twoFactorEnabled) {
      const session = await createSession(user._id.toString());
      res.cookie("sessionId", session.sessionId, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      });
      
      createAndSendTokens(user, res);
      return;
    }

    const twoFactorCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.twoFactorCode = crypto
      .createHash("sha256")
      .update(twoFactorCode)
      .digest("hex");
    user.twoFactorCodeExpires = new Date(Date.now() + 20 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: "Your 2FA verification code",
      message: `Your two-factor authentication code is: ${twoFactorCode}. It expires in 20 minutes.`,
    });

    const twoFAToken = sign2FAToken(user._id.toString());

    res.status(200).json({
      status: "2fa_required",
      message:
        "A verification code has been sent to your email. Please verify to complete login.",
      twoFAToken,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyJWT = (token: string): string | JwtPayload | null => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT secret not set");
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (err: any) {
    console.error("JWT verification failed:", err.message);
    return null;
  }
};

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.cookies.jwt;

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

export const verify2fa = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    const ipHeader = req.headers["x-forwarded-for"] || req.ip;
    const ip = Array.isArray(ipHeader) ? ipHeader[0] : ipHeader || req.ip;
    const ipString = ip ?? "127.0.0.1";

    const userAgent = req.headers["user-agent"] || "";
    const { browser, cpu, device, os } = UAParser(userAgent);

    let geoData: any = null;
    try {
      geoData = geoReader.city(ipString);
    } catch (err: any) {
      if (err.name !== "AddressNotFoundError") throw err;
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid 2FA session" });
    }

    const user = await User.findById(decoded.userId).select(
      "+twoFactorCode +twoFactorCodeExpires +failed2FAAttempts +twoFALockUntil"
    );

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(403).json({
        message: "Account locked",
        lockUntil: user.lockUntil,
      });
    }

    if (
      !user.twoFactorCode ||
      !user.twoFactorCodeExpires ||
      user.twoFactorCodeExpires < new Date()
    ) {
      return res.status(400).json({ message: "2FA code expired or not set" });
    }

    const { twoFACode } = req.body;
    const hashedCode = crypto
      .createHash("sha256")
      .update(twoFACode)
      .digest("hex");

    if (hashedCode !== user.twoFactorCode) {
      user.failed2FAAttempts = (user.failed2FAAttempts || 0) + 1;

      let attemptStatus: "failed" | "locked" = "failed";
      let attemptMessage = "Invalid 2FA code";

      if (user.failed2FAAttempts >= 10) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.isLocked = true;
        user.failed2FAAttempts = 0;
        user.twoFactorCode = undefined;
        user.twoFactorCodeExpires = undefined;
        await user.save({ validateBeforeSave: false });

        attemptStatus = "locked";
        attemptMessage = "Account locked due to too many failed 2FA attempts";

        await recordLoginAttempt({
          userId: user._id.toString(),
          username: user.username,
          ip: ipString,
          device: { browser, cpu, device, os },
          geo: geoData,
          status: attemptStatus,
          message: attemptMessage,
        });

        return res.status(403).json({
          status: "locked",
          message:
            "Your account access has been restricted. Please contact your organization’s admin.",
        });
      }

      await user.save({ validateBeforeSave: false });

      await recordLoginAttempt({
        userId: user._id.toString(),
        username: user.username,
        ip: ipString,
        device: { browser, cpu, device, os },
        geo: geoData,
        status: "failed",
        message: attemptMessage,
      });

      return res.status(401).json({ message: "Invalid 2FA code" });
    }

    user.failed2FAAttempts = 0;
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    await recordLoginAttempt({
      userId: user._id.toString(),
      username: user.username,
      ip: ipString,
      device: { browser, cpu, device, os },
      geo: geoData,
      status: "success",
      message: "2FA verified successfully",
    });

    const session = await createSession(user._id.toString());

    res.cookie("sessionId", session.sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    createAndSendTokens(user, res);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "There is no user with that email address!",
    });
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  user.verificationCode = verificationCode;
  user.verificationCodeExpires = expires;
  await user.save({ validateBeforeSave: false });

  try {
    const message = `Your password reset code is: ${verificationCode}`;
    await sendEmail({
      email: user.email,
      subject: "Your password reset code",
      message,
    });

    return res.status(200).json({
      message: "A 6-digit code has been sent to your email.",
    });
  } catch (err) {
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      message: "Failed to send verification code. Please try again.",
    });
  }
};

export const verifyResetCode = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email, code } = req.body;

  const user = await User.findOne({ email }).select("+verificationCode");

  if (
    !user ||
    !user.verificationCode ||
    user.verificationCode !== code ||
    !user.verificationCodeExpires ||
    user.verificationCodeExpires < new Date()
  ) {
    return res.status(400).json({ message: "Incorrect code." });
  }

  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({ message: "Code verified. Proceed to reset." });
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save({ validateBeforeSave: false });

    createAndSendTokens(user, res);
    return res
      .status(200)
      .json({ message: "Your password has been updated successfully." });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.changePasswordAfter(decoded.iat)) {
      return res
        .status(401)
        .json({ message: "Password recently changed. Please log in again." });
    }

    const newAccessToken = signToken(user._id.toString());

    res.cookie("jwt", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const sessionId = req.cookies.sessionId;

  if (sessionId) {
    await terminateSession(sessionId);
    res.clearCookie("sessionId");
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

async function getLocation(ip: string) {
  try {
    const response = await geoReader.city(ip);

    return {
      country: response?.country?.isoCode ?? null,
      countryName: response?.country?.names?.en ?? null,
      city: response?.city?.names?.en ?? null,
      latitude: response?.location?.latitude ?? null,
      longitude: response?.location?.longitude ?? null,
    };
  } catch (err) {
    console.error("Geo lookup failed:", err);
    return null;
  }
}
