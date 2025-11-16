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
import { addCorrelationId } from "./middlewares/correlationId.js";

const app = express();

app.use(addCorrelationId);

const origin = process.env.CLIENT_ORIGIN?.replace(/^"|"$/g, "") || "https://dev.examate.net";

app.use(cors({
  origin: origin,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

import mongoSanitize from "express-mongo-sanitize";
// ...
app.use(express.json());
app.use(cookieParser());

const sanitize = mongoSanitize.sanitize;
const sanitizeRequest = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  const scrub = (value: unknown) => {
    if (value && typeof value === "object") {
      sanitize(value as Record<string, unknown>);
    }
  };

  scrub(req.body);
  scrub(req.params);
  scrub(req.headers);
  scrub(req.query);

  next();
};

app.use(sanitizeRequest);
// ...

import logger from "./utils/logger.js";
import { handleError } from "./middlewares/errorHandler.js";
app.use(handleError);

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error("MONGO_URI environment variable is not set.");
}

mongoose
  .connect(mongoUri)
  .then(() => logger.info("MongoDB connected"))
  .catch((err) => logger.error(err));

app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

const PORT = Number(process.env.PORT) || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin,
    credentials: true,
  },
});

watchSessions(io);

io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);
});

httpServer.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
