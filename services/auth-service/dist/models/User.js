import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
    },
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
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords are not the same!",
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});
//       username: {
//         type: String,
//         unique: true
//       },
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
userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) {
        return next();
    }
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
});
// userSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword
// ) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };
const User = mongoose.model("User", userSchema);
export default User;
