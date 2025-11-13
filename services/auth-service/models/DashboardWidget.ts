import mongoose, { Document, Schema } from "mongoose";

export interface IDashboardWidget extends Document {
  userId: mongoose.Types.ObjectId;
  client: string;
  title: string;
  type:
    | "activeAll"
    | "paidUnpaid"
    | "location"
    | "historyAll"
    | "passFail"
    | "proctoredOffline";
  legendVisibility: Map<string, boolean>;
  order: number;
  dataSourceParams?: any;
  createdAt: Date;
  updatedAt: Date;
}

const dashboardWidgetSchema = new Schema<IDashboardWidget>(
  {
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
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying by user and client
dashboardWidgetSchema.index({ userId: 1, client: 1, order: 1 });

const DashboardWidget = mongoose.model<IDashboardWidget>(
  "DashboardWidget",
  dashboardWidgetSchema
);

export default DashboardWidget;
