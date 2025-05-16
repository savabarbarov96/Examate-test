import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";
const users = {
    "user@example.com": {
        email: "user@example.com",
        password: "test1234",
    },
};
const cookieOptions = {
    // expires: new Date(
    //   Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    // ),
    httpOnly: true,
};
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "8h",
        // process.env.JWT_EXPIRES_IN,
    });
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Please provide email and password!" });
        }
        const user = await User.findOne({ email }).select("+password");
        const isPasswordValid = user && (await bcrypt.compare(password, user.password));
        if (!isPasswordValid) {
            console.log("Invalid credentials");
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res
                .status(500)
                .json({ message: "JWT secret is not configured in the environment." });
        }
        // const token = jwt.sign({ email }, secret, { expiresIn: "1h" });
        const token = signToken(user._id);
        res.status(200).json({ token });
    }
    catch (error) {
        next(error);
    }
};
export const verifyJWT = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("JWT secret not set");
        return null;
    }
    try {
        return jwt.verify(token, secret);
    }
    catch (err) {
        console.error("JWT verification failed:", err.message);
        return null;
    }
};
// export const protect = async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   } else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }
//   // if (!token) {
//   //   return next(
//   //     new AppError('You are not logged in! Please log in to continue', 401)
//   //   );
//   //   // res.redirect('/');
//   // }
//   // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
//   // const currentUser = await User.findById(decoded.id);
//   // if (!currentUser) {
//   //   return next(
//   //     new APIFeatures('The user belonging to this token does no longer exist'),
//   //     401
//   //   );
//   // }
//   // const isPasswordChanged = currentUser.changePasswordAfter(decoded.iat);
//   // if (isPasswordChanged) {
//   //   return next(
//   //     new AppError('User recently changed password! Please log in again!', 401)
//   //   );
//   // }
//   // req.user = currentUser;
//   next();
// };
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        // return next(new AppError('There is no user with that email address!', 404));
        console.log("Such user is non-existing");
        return res
            .status(404)
            .json({ message: "There is no user with that email address!" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    // user.createPasswordResetToken();
    // await user.save({ validateBeforeSave: false });
    try {
        const resetURL = `http://localhost:8080/reset-password/${resetToken}`;
        // `${req.protocol}://${req.get(
        //   "host"
        // )}/api/auth/resetPassword/${resetToken}`;
        const message = `Forgot your password? Submit request with your new password and passwordConfirm to ${resetURL}\nIf you didn't forget your password, please ignore this email.`;
        console.log(" hello ");
        await sendEmail({
            email: user.email,
            subject: "Your password reset token (valid for 10 min)",
            message,
        });
        // await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: "success",
            message: "Token sent to email",
        });
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500).json({
            status: "success",
            message: "There is an error sending the email. Try again later!",
        });
    }
};
export const resetPassword = async (req, res, next) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now(),
        },
    });
    if (!user) {
        return res
            .status(400)
            .json({ message: "Token is invalid or has expired!" });
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    const token = signToken(user._id);
    res.status(200).json({ token });
};
