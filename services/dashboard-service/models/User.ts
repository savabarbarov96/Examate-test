import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  client?: string;
  email?: string;
}

const userSchema = new Schema<IUser>(
  {
    client: { type: String, trim: true },
    email: { type: String, trim: true },
  },
  {
    collection: "users",
    strict: false,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
