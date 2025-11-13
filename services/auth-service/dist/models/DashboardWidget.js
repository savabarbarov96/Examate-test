import mongoose, { Schema } from "mongoose";
const dashboardWidgetSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    client: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    title: {
        type: String,
        default: "New Widget",
        trim: true,
    },
    type: {
        type: String,
        enum: [
            "activeAll",
            "paidUnpaid",
            "location",
            "historyAll",
            "passFail",
            "proctoredOffline",
        ],
        required: true,
    },
    legendVisibility: {
        type: Map,
        of: Boolean,
        default: new Map(),
    },
    order: {
        type: Number,
        required: true,
    },
    dataSourceParams: {
        type: Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
// Compound index for efficient querying by user and client
dashboardWidgetSchema.index({ userId: 1, client: 1, order: 1 });
const DashboardWidget = mongoose.model("DashboardWidget", dashboardWidgetSchema);
export default DashboardWidget;
