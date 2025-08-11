import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserMethods {
  changePasswordAfter(JWTTimestamp: number): boolean;
}

export interface IUser extends IUserMethods {
  email: string;
  username: string;
  status: string;
  accountLocked: boolean;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorCode?: string;
  twoFactorCodeExpires?: Date;
  failedLoginAttempts: number;
  lastFailedLoginAttempt?: Date;
  isLocked: boolean;
  firstLogin: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  failed2FAAttempts: number;
  lockUntil?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 30,
    trim: true,
    unique: true,
    validate: {
      validator: function (value: string) {
        return /^[a-zA-Z0-9\-]+$/.test(value);
      },
      message: "Username contains invalid characters.",
    },
  },
  status: {
    type: String,
    default: "unverified",
  },
  accountLocked: { type: Boolean, default: false },
  password: {
    required: [true, "A user must have password!"],
    type: String,
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    required: [true, "A user must confirm his password!"],
    type: String,
    validate: {
      validator: function (el: string) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date,
  twoFactorCode: {
    type: String,
    select: false,
  },
  twoFactorCodeExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: true,
  },
  failedLoginAttempts: { type: Number, default: 0 },
  lastFailedLoginAttempt: Date,
  isLocked: { type: Boolean, default: false },
  verificationCode: {
    type: String,
    select: false,
  },
  verificationCodeExpires: Date,
  firstLogin: {
    type: Boolean,
    default: true,
  },
  failed2FAAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
});

//       first_name: {
//         type: String,
//       },
//       last_name: {
//         type: String,
//       },
//       organisation: {
//         type: String,
//       },
//       phone: {
//         type: String,
//       },
//       role: {
//         type: String
//       },
//       first_login: {
//         type: Boolean,
//         default: true
//       },
//       is_proctor: {
//         type: Boolean,
//         default: false
//       },
//       channel_id: {
//         type: String
//       },
//       countries: [],
//       role: {},
//       dashboard_items: [],
//       // {
//         // type: Array,
//         // "default": [
//         //   {
//         //     title: String,
//         //     item_type: String,
//         //     statistic_type: String,
//         //     filters: {},
//         //   }
//         // ]
//       // }
//       // usePushEach : true
//     });

//   }
// }

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.changePasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      // @ts-ignore
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

// userSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword
// ) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password") || this.isNew) return next();

//   next();
// });

const User = mongoose.model<IUser>("User", userSchema);

export default User;
