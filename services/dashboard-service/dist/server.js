import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dashboardRoutes from "./routes/dashboard.js";
const app = express();
const defaultOrigins = "http://localhost:8080,http://localhost:3000";
const allowedOrigins = (process.env.CLIENT_ORIGIN || defaultOrigins)
    .split(",")
    .map((value) => value.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
const corsOptions = {
    origin: (requestOrigin, callback) => {
        if (!requestOrigin || allowedOrigins.includes("*") || allowedOrigins.includes(requestOrigin)) {
            return callback(null, true);
        }
        console.warn(`Blocked CORS request from origin: ${requestOrigin}`);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
// Short-circuit explicit OPTIONS requests so path-to-regexp is not involved
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});
app.use(express.json());
app.use(cookieParser());
app.use((err, req, res, _next) => {
    console.error("Unhandled backend error:", err);
    res.status(500).json({ message: err.message || "Server error" });
});
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Dashboard Service - MongoDB connected"))
    .catch((err) => console.error("Dashboard Service - MongoDB connection error:", err));
app.get("/", (req, res) => {
    res.json({
        service: "Dashboard Service",
        version: "1.0.0",
        status: "running",
        port: process.env.PORT || 5002,
    });
});
app.use("/api/dashboard", dashboardRoutes);
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Dashboard Service running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});
