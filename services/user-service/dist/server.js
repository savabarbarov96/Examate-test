import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.js";
import roleRoutes from "./routes/role.js";
dotenv.config();
const app = express();
const origin = process.env.CLIENT_ORIGIN?.replace(/^"|"$/g, "") || "http://localhost:8080";
app.use(cors({
    origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options(/.*/, cors({
    origin: origin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser());
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));
app.get("/", (req, res) => {
    res.send("User Service is running 🚀");
});
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
