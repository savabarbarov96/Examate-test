import dotenv from "dotenv";
// IMPORTANT: Load environment variables FIRST before any other imports
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import { watchSessions } from "./utils/session.js";
import authRoutes from "./routes/user.js";
import sessionRoutes from "./routes/session.js";
import dashboardRoutes from "./routes/dashboard.js";
const app = express();
const origin = process.env.CLIENT_ORIGIN?.replace(/^"|"$/g, '') || "https://dev.examate.net";
app.use(cors({
    origin: origin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options(/.*/, cors({
    origin: origin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());
app.use((err, req, res, next) => {
    console.error("Unhandled backend error:", err);
    res.status(500).json({ message: err.message || "Server error" });
});
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));
app.get("/", (req, res) => {
    res.send("API is working");
});
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/dashboard", dashboardRoutes);
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin,
        credentials: true,
    },
});
watchSessions(io);
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
});
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
