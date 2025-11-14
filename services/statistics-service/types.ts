export type WidgetType =
  | "activeAll"
  | "paidUnpaid"
  | "location"
  | "historyAll"
  | "passFail"
  | "proctoredOffline";

export type WidgetCategory = "charts" | "analytics";

export interface WidgetCatalogItem {
  type: WidgetType;
  title: string;
  description: string;
  defaultName: string;
  category: WidgetCategory;
}
