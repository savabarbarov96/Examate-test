import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    client: { type: String, trim: true },
    email: { type: String, trim: true },
}, {
    collection: "users",
    strict: false,
});
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
