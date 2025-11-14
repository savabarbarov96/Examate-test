import mongoose, { Schema } from "mongoose";
const paymentSchema = new Schema({
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
}, {
    timestamps: true,
});
// Indexes for efficient querying
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
