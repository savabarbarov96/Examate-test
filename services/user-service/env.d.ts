import { IUser } from "../models/User";

declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_URI: string;
    JWT_SECRET: string;
    PORT?: string;
  }
}
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
