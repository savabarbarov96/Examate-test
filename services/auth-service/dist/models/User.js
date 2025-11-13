import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
    firstName: { type: String, trim: true, maxlength: 30 },
    lastName: { type: String, trim: true, maxlength: 30 },
    email: { type: String, unique: true },
    username: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 30,
        trim: true,
        unique: true,
        validate: {
            validator: (value) => /^[a-zA-Z0-9\-]+$/.test(value),
            message: "Username contains invalid characters.",
        },
    },
    status: { type: String, default: "unverified" },
    accountLocked: { type: Boolean, default: false },
    password: { type: String, required: true, minlength: 8, select: false },
    passwordConfirm: {
        type: String,
        required: [true, "Confirm password is required"],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords are not the same!",
        },
    },
    passwordChangedAt: Date,
    twoFactorCode: { type: String, select: false },
    twoFactorCodeExpires: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lastFailedLoginAttempt: Date,
    isLocked: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationCodeExpires: Date,
    firstLogin: { type: Boolean, default: true },
    failed2FAAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    if (!this.isNew) {
        this.passwordChangedAt = new Date(Date.now() - 1000);
    }
    next();
});
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000).toString(), 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};
const User = mongoose.model("User", userSchema);
export default User;
