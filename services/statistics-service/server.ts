import dotenv from "dotenv";

dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";

import statisticsRoutes from "./routes/statistics.js";

const app = express();

const defaultOrigins = "http://localhost:8080,http://localhost:3000";
const allowedOrigins = (process.env.CLIENT_ORIGIN || defaultOrigins)
  .split(",")
  .map((value) => value.trim().replace(/^"|"$/g, ""))
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (requestOrigin, callback) => {
    if (!requestOrigin || allowedOrigins.includes("*") || allowedOrigins.includes(requestOrigin)) {
      return callback(null, true);
    }

    console.warn(`Statistics Service blocked origin: ${requestOrigin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    service: "Statistics Service",
    status: "running",
    port: process.env.PORT || 5003,
  });
});

app.use("/api/statistics", statisticsRoutes);

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Statistics Service - Unhandled error", err);
  res.status(500).json({ message: err?.message || "Statistics service error" });
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Statistics Service - MongoDB connected");
  } catch (error) {
    console.error("Statistics Service - MongoDB connection error", error);
    process.exit(1);
  }

  const PORT = process.env.PORT || 5003;
  app.listen(PORT, () => {
    console.log(`Statistics Service running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
  });
};

start();
