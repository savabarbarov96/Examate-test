import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { UAParser } from "ua-parser-js";
import User from "../models/User.js";
import LoginAttempt from "../models/LoginAttempt.js";
import { sendEmail } from "../utils/email.js";
import { createSession, terminateSession } from "../utils/session.js";
import { geoReader } from "../utils/geo.js";
import { recordLoginAttempt } from "../utils/logger.js";
const isProduction = process.env.NODE_ENV === "production";
const cookieDomain = isProduction ? ".examate.net" : undefined;
const ACCESS_TOKEN_EXPIRATION_MINUTES = Math.max(5, parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN_MINUTES || "60", 10));
const ACCESS_TOKEN_EXPIRATION = `${ACCESS_TOKEN_EXPIRATION_MINUTES}m`;
const ACCESS_TOKEN_COOKIE_MAX_AGE = ACCESS_TOKEN_EXPIRATION_MINUTES * 60 * 1000;
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured in the environment.");
    }
    return secret;
};
const signToken = (id) => {
    const options = {
        expiresIn: ACCESS_TOKEN_EXPIRATION,
    };
    return jwt.sign({ id }, getJwtSecret(), options);
};
const sign2FAToken = (userId) => {
    const options = { expiresIn: "5m" };
    return jwt.sign({ userId }, getJwtSecret(), options);
};
export const promisifyJWTVerification = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err)
                return reject(err);
            resolve(decoded);
        });
    });
};
const createAndSendTokens = (user, res) => {
    const accessToken = signToken(user._id.toString());
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "8h",
    });
    res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
        domain: cookieDomain,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 8 * 24 * 60 * 60 * 1000,
        domain: cookieDomain,
    });
    user.password = undefined;
    res.status(200).json({
        status: "success",
        user,
    });
};
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError, } from "../utils/ApiError.js";
import logger from "../utils/logger.js";
// ...
export const login = async (req, res, next) => {
    try {
        const ipHeader = req.headers["x-forwarded-for"] || req.ip;
        const ip = Array.isArray(ipHeader) ? ipHeader[0] : ipHeader || req.ip;
        const ipString = ip ?? "127.0.0.1";
        const userAgent = req.headers["user-agent"] || "";
        const { browser, cpu, device, os } = UAParser(userAgent);
        let geoData = null;
        try {
            geoData = geoReader.city(ipString);
        }
        catch (err) {
            if (err.name === "AddressNotFoundError") {
                logger.warn(`Geo lookup failed for IP: ${ip}`);
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
            return next(new BadRequestError("Please provide username and password!"));
        }
        const user = await User.findOne({ username }).select("+password +twoFactorCode +twoFactorCodeExpires +twoFactorEnabled +status +isLocked +lockUntil");
        if (!user) {
            await recordLoginAttempt({
                username,
                ip: ipString,
                device: { browser, cpu, device, os },
                status: "failed",
                message: "Invalid username",
            });
            return next(new UnauthorizedError("Invalid credentials"));
        }
        const now = new Date();
        if (user?.isLocked && user.lockUntil && user.lockUntil <= now) {
            user.isLocked = false;
            user.lockUntil = undefined;
            user.failedLoginAttempts = 0;
            await user.save({ validateBeforeSave: false });
            logger.info(`User ${user.username} unlocked automatically after lock expired.`);
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
            return next(new ForbiddenError("Your account access has been restricted. Please contact your organization’s admin."));
        }
        const isPasswordValid = user && (await bcrypt.compare(password, user.password));
        if (!isPasswordValid) {
            if (user.lastFailedLoginAttempt &&
                now.getTime() - user.lastFailedLoginAttempt.getTime() <= 60 * 1000) {
                user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            }
            else {
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
                return next(new ForbiddenError("Your account access has been restricted. Please contact your organization’s admin."));
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
            return next(new UnauthorizedError("Invalid credentials."));
        }
        if (user.failedLoginAttempts && user.failedLoginAttempts > 0) {
            user.failedLoginAttempts = 0;
            user.lastFailedLoginAttempt = undefined;
            user.lockUntil = undefined;
            user.isLocked = false;
            await user.save({ validateBeforeSave: false });
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
            return next(new ForbiddenError("Unverified account. Please complete the verification process or contact your administrator."));
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
                domain: cookieDomain,
            });
            createAndSendTokens(user, res);
            return;
        }
        const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
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
            message: "A verification code has been sent to your email. Please verify to complete login.",
            twoFAToken,
        });
    }
    catch (error) {
        next(error);
    }
};
export const verifyJWT = (token) => {
    try {
        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret);
        return decoded;
    }
    catch (err) {
        logger.error(`JWT verification failed: ${err.message}`);
        return null;
    }
};
import { redis } from "../utils/session.js";
// ...
export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const sessionId = req.cookies.sessionId;
        if (!token) {
            return next(new UnauthorizedError("Not authenticated"));
        }
        if (sessionId) {
            const session = await redis.get(`session:${sessionId}`);
            if (!session) {
                return next(new UnauthorizedError("Session expired"));
            }
        }
        const decoded = jwt.verify(token, getJwtSecret());
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new UnauthorizedError("User not found"));
        }
        if (typeof decoded.iat === "number" && user.changePasswordAfter(decoded.iat)) {
            return next(new UnauthorizedError("Password recently changed"));
        }
        req.user = user;
        next();
    }
    catch (err) {
        return next(new UnauthorizedError("Invalid or expired token"));
    }
};
export const verify2fa = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const ipHeader = req.headers["x-forwarded-for"] || req.ip;
        const ip = Array.isArray(ipHeader) ? ipHeader[0] : ipHeader || req.ip;
        const ipString = ip ?? "127.0.0.1";
        const userAgent = req.headers["user-agent"] || "";
        const { browser, cpu, device, os } = UAParser(userAgent);
        let geoData = null;
        try {
            geoData = geoReader.city(ipString);
        }
        catch (err) {
            if (err.name !== "AddressNotFoundError")
                throw err;
        }
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new UnauthorizedError("Missing or invalid token"));
        }
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, getJwtSecret());
        }
        catch (err) {
            return next(new UnauthorizedError("Invalid or expired token"));
        }
        if (!decoded.userId) {
            return next(new UnauthorizedError("Invalid 2FA session"));
        }
        const user = await User.findById(decoded.userId).select("+twoFactorCode +twoFactorCodeExpires +failed2FAAttempts +twoFALockUntil");
        if (!user) {
            return next(new BadRequestError("User not found"));
        }
        if (user.lockUntil && user.lockUntil > new Date()) {
            return next(new ForbiddenError(`Account locked. Please try again after ${user.lockUntil}`));
        }
        if (!user.twoFactorCode ||
            !user.twoFactorCodeExpires ||
            user.twoFactorCodeExpires < new Date()) {
            return next(new BadRequestError("2FA code expired or not set"));
        }
        const { twoFACode } = req.body;
        const hashedCode = crypto
            .createHash("sha256")
            .update(twoFACode)
            .digest("hex");
        if (hashedCode !== user.twoFactorCode) {
            user.failed2FAAttempts = (user.failed2FAAttempts || 0) + 1;
            let attemptStatus = "failed";
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
                return next(new ForbiddenError("Your account access has been restricted. Please contact your organization’s admin."));
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
            return next(new UnauthorizedError("Invalid 2FA code"));
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
            domain: cookieDomain,
        });
        createAndSendTokens(user, res);
    }
    catch (error) {
        next(error);
    }
};
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return next(new NotFoundError("There is no user with that email address!"));
        }
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
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
        }
        catch (err) {
            user.verificationCode = undefined;
            user.verificationCodeExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return next(new InternalServerError("Failed to send verification code. Please try again."));
        }
    }
    catch (err) {
        next(err);
    }
};
export const refreshAccessToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return next(new UnauthorizedError("Refresh token missing"));
        }
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new UnauthorizedError("User not found"));
        }
        if (user.changePasswordAfter(decoded.iat)) {
            return next(new UnauthorizedError("Password recently changed. Please log in again."));
        }
        const newAccessToken = signToken(user._id.toString());
        res.cookie("jwt", newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 15 * 60 * 1000,
            domain: cookieDomain,
        });
        res.status(200).json({ message: "Token refreshed" });
    }
    catch (err) {
        next(new UnauthorizedError("Invalid or expired refresh token"));
    }
};
export const logout = async (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
        await terminateSession(sessionId);
        res.clearCookie("sessionId");
    }
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        domain: cookieDomain,
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        domain: cookieDomain,
    });
    res.status(200).json({ message: "Logged out successfully" });
};
// async function getLocation(ip: string) {
//   try {
//     const response = await geoReader.city(ip);
//     return {
//       country: response?.country?.isoCode ?? null,
//       countryName: response?.country?.names?.en ?? null,
//       city: response?.city?.names?.en ?? null,
//       latitude: response?.location?.latitude ?? null,
//       longitude: response?.location?.longitude ?? null,
//     };
//   } catch (err) {
//     console.error("Geo lookup failed:", err);
//     return null;
//   }
// }
export const verifyActivationOrResetPassToken = async (req, res, next) => {
    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");
        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid or expired activation link" });
        }
        res.status(200).json({
            status: "success",
            message: "Token valid. Proceed to change password.",
            userId: user._id,
        });
    }
    catch (err) {
        next(err);
    }
};
export const changePassword = async (req, res, next) => {
    try {
        const { userId, newPassword } = req.body;
        if (!userId || !newPassword) {
            return next(new BadRequestError("Missing required fields"));
        }
        const user = await User.findById(userId).select("+password");
        if (!user) {
            return next(new NotFoundError("User not found"));
        }
        user.password = newPassword;
        user.passwordConfirm = newPassword;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        user.status = "verified";
        await user.save();
        const ipHeader = req.headers["x-forwarded-for"] || req.ip;
        const ip = Array.isArray(ipHeader) ? ipHeader[0] : ipHeader || req.ip;
        const ipString = ip ?? "127.0.0.1";
        const userAgent = req.headers["user-agent"] || "";
        const { browser, cpu, device, os } = UAParser(userAgent);
        let geoData = null;
        try {
            geoData = geoReader.city(ipString);
        }
        catch (err) {
            if (err.name === "AddressNotFoundError") {
                logger.warn(`Geo lookup failed for IP: ${ip}`);
            }
        }
        const session = await createSession(user._id.toString());
        res.cookie("sessionId", session.sessionId, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            domain: cookieDomain,
        });
        createAndSendTokens(user, res);
        await recordLoginAttempt({
            userId: user._id.toString(),
            username: user.username,
            ip: ipString,
            device: { browser, cpu, device, os },
            status: "success",
            message: "Password changed successfully ",
        });
        res.status(200).json({
            status: "success",
            message: "Password changed successfully",
        });
    }
    catch (err) {
        next(err);
    }
};
export const sendActivationOrResetPassLink = async (req, res, next) => {
    try {
        const { email, purpose = "activation" } = req.body;
        if (!email) {
            return next(new BadRequestError("Email is required"));
        }
        const user = await User.findOne({ email });
        if (!user) {
            return next(new NotFoundError("User not found"));
        }
        if (user.status === "verified") {
            return next(new BadRequestError("User already verified"));
        }
        const token = crypto.randomBytes(32).toString("hex");
        user.verificationToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
        user.verificationExpires = new Date(Date.now() + 12 * 60 * 60 * 1000);
        await user.save({ validateBeforeSave: false });
        const link = `${process.env.CLIENT_ORIGIN || "http://localhost:3000"}${purpose === " activation" ? "/activate" : "change-password"}/${token}`;
        await sendEmail({
            email: user.email,
            subject: purpose === "activation"
                ? "Account Activation Link"
                : "Change Password Link",
            html: `
        <p>Hello, ${user.username}!</p>
        <p>Here is your ${purpose === "activation" ? "activation" : "password change"} link:
        <a href="${link}">Click here</a>
        <p>This link is valid for 12 hours.</p>
      `,
        });
        res.status(200).json({
            status: "success",
            message: `New ${purpose} link sent to your email.`,
        });
    }
    catch (err) {
        next(err);
    }
};
export const getLastLogin = async (req, res, next) => {
    try {
        const userId = req.user?._id.toString();
        // Query the two most recent successful logins so we can skip the current session
        const recentAttempts = await LoginAttempt.find({
            userId,
            status: "success",
        })
            .sort({ timestamp: -1 })
            .limit(2);
        if (!recentAttempts.length) {
            return res.status(200).json({ lastLogin: null });
        }
        const [, previousAttempt] = recentAttempts;
        const lastRelevantAttempt = previousAttempt ?? recentAttempts[0];
        res.status(200).json({
            lastLogin: lastRelevantAttempt.timestamp.toISOString(),
        });
    }
    catch (error) {
        next(new InternalServerError("Failed to fetch last login"));
    }
};
