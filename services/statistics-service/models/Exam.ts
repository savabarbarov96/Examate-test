import mongoose, { Document, Schema } from "mongoose";

export interface IExam extends Document {
  userId: string;
  username: string;
  examType: "proctored" | "offline";
  examName: string;
  result: "pass" | "fail";
  score: number;
  maxScore: number;
  startedAt: Date;
  completedAt: Date;
  duration: number; // in minutes
}

const examSchema = new Schema<IExam>(
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
    examType: {
      type: String,
      enum: ["proctored", "offline"],
      required: true,
    },
    examName: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      enum: ["pass", "fail"],
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
examSchema.index({ userId: 1, completedAt: -1 });
examSchema.index({ examType: 1 });
examSchema.index({ result: 1 });

const Exam = mongoose.model<IExam>("Exam", examSchema);

export default Exam;
