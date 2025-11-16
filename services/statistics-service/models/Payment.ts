import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  userId: string;
  username: string;
  examId: string;
  examName: string;
  amount: number;
  currency: string;
  status: "paid" | "unpaid" | "pending" | "failed";
  paymentMethod: string | null;
  transactionId: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
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
    examId: {
      type: String,
      required: true,
    },
    examName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["paid", "unpaid", "pending", "failed"],
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      default: null,
    },
    transactionId: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
