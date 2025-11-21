import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  userId: string;
  username: string;
  sessionId: string;
  device: {
    browser: {
      name: string;
      version: string;
    };
    os: {
      name: string;
      version: string;
    };
  };
  ip: string;
  location: {
    country: string;
    city: string;
  };
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    device: {
      browser: {
        name: String,
        version: String,
      },
      os: {
        name: String,
        version: String,
      },
    },
    ip: {
      type: String,
      required: true,
    },
    location: {
      country: String,
      city: String,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastActivity: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false, // Using manual createdAt
  }
);

// Index for cleaning up expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Indexes for efficient querying
sessionSchema.index({ userId: 1, expiresAt: 1 });

const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;
