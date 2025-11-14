import { Request, Response } from "express";
import { widgetCatalog } from "../utils/widgetCatalog.js";
import { getWidgetDataByType } from "../utils/dataAggregation.js";
import type { WidgetType } from "../types.js";

export const listAvailableWidgets = (req: Request, res: Response): void => {
  res.json(widgetCatalog);
};

export const getWidgetDefinition = (req: Request, res: Response): void => {
  const { type } = req.params;
  const widget = widgetCatalog.find((item) => item.type === type);

  if (!widget) {
    res.status(404).json({ message: "Unknown widget type" });
    return;
  }

  res.json(widget);
};

export const getWidgetData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const widgetType = type as WidgetType;
    const widget = widgetCatalog.find((item) => item.type === widgetType);

    if (!widget) {
      res.status(404).json({ message: "Unknown widget type" });
      return;
    }

    const data = await getWidgetDataByType(widgetType);
    res.json(data);
  } catch (error) {
    console.error("StatisticsService:getWidgetData", error);
    res.status(500).json({ message: "Failed to build widget data" });
  }
};
