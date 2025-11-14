import type { HydratedDocument } from "mongoose";
import type { IUser } from "./models/User.js";

declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_URI: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    PORT?: string;
    NODE_ENV?: string;
    CLIENT_ORIGIN?: string;
    REDIS_URL?: string;
    ACCESS_TOKEN_EXPIRES_IN_MINUTES?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>;
    }
  }
}

export {};
