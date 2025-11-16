import { widgetCatalog } from "../utils/widgetCatalog.js";
import { getWidgetDataByType } from "../utils/dataAggregation.js";
export const listAvailableWidgets = (req, res) => {
    res.json(widgetCatalog);
};
export const getWidgetDefinition = (req, res) => {
    const { type } = req.params;
    const widget = widgetCatalog.find((item) => item.type === type);
    if (!widget) {
        res.status(404).json({ message: "Unknown widget type" });
        return;
    }
    res.json(widget);
};
export const getWidgetData = async (req, res) => {
    try {
        const { type } = req.params;
        const widgetType = type;
        const widget = widgetCatalog.find((item) => item.type === widgetType);
        if (!widget) {
            res.status(404).json({ message: "Unknown widget type" });
            return;
        }
        const data = await getWidgetDataByType(widgetType);
        res.json(data);
    }
    catch (error) {
        console.error("StatisticsService:getWidgetData", error);
        res.status(500).json({ message: "Failed to build widget data" });
    }
};
