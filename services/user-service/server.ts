import dotenv from "dotenv";

// IMPORTANT: Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import { initializeRoles } from "./utils/seedRoles.js";

import userRoutes from "./routes/user.js";
import roleRoutes from "./routes/role.js";
const app = express();

const origin =
  process.env.CLIENT_ORIGIN?.replace(/^"|"$/g, "") || "https://dev.examate.net";

app.use(
  cors({
    origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(async () => {
    console.log("MongoDB connected");

    await initializeRoles(); 
  })
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("User Service is running 🚀");
});

app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
