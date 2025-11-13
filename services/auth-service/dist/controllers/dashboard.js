import DashboardWidget from "../models/DashboardWidget.js";
// Validation helper: Check if widget belongs to user and client
const validateWidgetOwnership = (widget, userId, client) => {
    return widget.userId.toString() === userId && widget.client === client;
};
const CHART_COLORS = {
    primary: "hsl(221.2 83.2% 53.3%)",
    success: "hsl(142.1 76.2% 36.3%)",
    warning: "hsl(38 92% 50%)",
    danger: "hsl(0 84.2% 60.2%)",
    info: "hsl(199.4 95% 47.3%)",
    purple: "hsl(262.1 83.3% 57.8%)",
};
// Mock data generator based on widget type
const generateMockData = (widgetType) => {
    switch (widgetType) {
        case "activeAll":
            return {
                series: ["Total Participants", "Proctored", "Offline"],
                data: [
                    { name: "Week 1", "Total Participants": 150, Proctored: 120, Offline: 30 },
                    { name: "Week 2", "Total Participants": 200, Proctored: 170, Offline: 30 },
                    { name: "Week 3", "Total Participants": 180, Proctored: 150, Offline: 30 },
                    { name: "Week 4", "Total Participants": 220, Proctored: 190, Offline: 30 },
                ],
            };
        case "historyAll":
            return {
                series: ["Pass", "Fail"],
                data: [
                    { name: "Jan", Pass: 85, Fail: 15 },
                    { name: "Feb", Pass: 92, Fail: 8 },
                    { name: "Mar", Pass: 88, Fail: 12 },
                    { name: "Apr", Pass: 95, Fail: 5 },
                    { name: "May", Pass: 90, Fail: 10 },
                    { name: "Jun", Pass: 93, Fail: 7 },
                ],
            };
        case "paidUnpaid":
            return {
                segments: [
                    { name: "Paid", value: 65, color: CHART_COLORS.success },
                    { name: "Unpaid", value: 35, color: CHART_COLORS.warning },
                ],
            };
        case "location":
            return {
                segments: [
                    { name: "North America", value: 35, color: CHART_COLORS.info },
                    { name: "Europe", value: 28, color: CHART_COLORS.success },
                    { name: "Asia", value: 22, color: CHART_COLORS.warning },
                    { name: "South America", value: 10, color: CHART_COLORS.purple },
                    { name: "Africa", value: 5, color: CHART_COLORS.danger },
                ],
            };
        case "passFail":
            return {
                segments: [
                    { name: "Pass", value: 78, color: CHART_COLORS.success },
                    { name: "Fail", value: 22, color: CHART_COLORS.danger },
                ],
            };
        case "proctoredOffline":
            return {
                segments: [
                    { name: "Proctored", value: 85, color: CHART_COLORS.primary },
                    { name: "Offline", value: 15, color: CHART_COLORS.warning },
                ],
            };
        default:
            return {
                series: [],
                data: [],
            };
    }
};
// GET /api/dashboard/widgets - List user's widgets
export const getWidgets = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user._id;
        // @ts-ignore
        const client = req.user.client;
        const widgets = await DashboardWidget.find({ userId, client }).sort({ order: 1 });
        res.status(200).json(widgets);
    }
    catch (error) {
        console.error("Error in getWidgets:", error);
        res.status(500).json({ message: "Failed to fetch widgets" });
    }
};
// POST /api/dashboard/widgets - Create new widget
export const createWidget = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user._id;
        // @ts-ignore
        const client = req.user.client;
        const { type, title, legendVisibility, dataSourceParams } = req.body;
        // Validate type
        const validTypes = [
            "activeAll",
            "paidUnpaid",
            "location",
            "historyAll",
            "passFail",
            "proctoredOffline",
        ];
        if (!type || !validTypes.includes(type)) {
            return res.status(400).json({
                message: "Invalid widget type. Must be one of: " + validTypes.join(", "),
            });
        }
        // Find the highest order number for this user/client
        const maxOrderWidget = await DashboardWidget.findOne({ userId, client })
            .sort({ order: -1 })
            .select("order");
        const order = maxOrderWidget ? maxOrderWidget.order + 1 : 0;
        // Create the widget
        const widget = await DashboardWidget.create({
            userId,
            client,
            type,
            title: title || "New Widget",
            legendVisibility: legendVisibility || new Map(),
            order,
            dataSourceParams: dataSourceParams || undefined,
        });
        res.status(201).json(widget);
    }
    catch (error) {
        console.error("Error in createWidget:", error);
        res.status(500).json({ message: "Failed to create widget" });
    }
};
// PATCH /api/dashboard/widgets/:id - Update widget
export const updateWidget = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user._id.toString();
        // @ts-ignore
        const client = req.user.client;
        const { id } = req.params;
        const widget = await DashboardWidget.findById(id);
        if (!widget) {
            return res.status(404).json({ message: "Widget not found" });
        }
        // Validate ownership and tenant access
        if (!validateWidgetOwnership(widget, userId, client)) {
            return res.status(403).json({
                message: "Access denied. You do not have permission to modify this widget.",
            });
        }
        // Extract allowed update fields
        const { title, legendVisibility, order, dataSourceParams } = req.body;
        // Update only provided fields
        if (title !== undefined)
            widget.title = title;
        if (legendVisibility !== undefined)
            widget.legendVisibility = legendVisibility;
        if (order !== undefined)
            widget.order = order;
        if (dataSourceParams !== undefined)
            widget.dataSourceParams = dataSourceParams;
        await widget.save();
        res.status(200).json(widget);
    }
    catch (error) {
        console.error("Error in updateWidget:", error);
        res.status(500).json({ message: "Failed to update widget" });
    }
};
// DELETE /api/dashboard/widgets/:id - Delete widget
export const deleteWidget = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user._id.toString();
        // @ts-ignore
        const client = req.user.client;
        const { id } = req.params;
        const widget = await DashboardWidget.findById(id);
        if (!widget) {
            return res.status(404).json({ message: "Widget not found" });
        }
        // Validate ownership and tenant access
        if (!validateWidgetOwnership(widget, userId, client)) {
            return res.status(403).json({
                message: "Access denied. You do not have permission to delete this widget.",
            });
        }
        await DashboardWidget.findByIdAndDelete(id);
        res.status(200).json({ message: "Widget deleted successfully" });
    }
    catch (error) {
        console.error("Error in deleteWidget:", error);
        res.status(500).json({ message: "Failed to delete widget" });
    }
};
// POST /api/dashboard/widgets/reorder - Update widget ordering
export const reorderWidgets = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user._id.toString();
        // @ts-ignore
        const client = req.user.client;
        const { widgetIds } = req.body;
        if (!Array.isArray(widgetIds) || widgetIds.length === 0) {
            return res.status(400).json({
                message: "widgetIds must be a non-empty array.",
            });
        }
        // Ensure every widget belongs to the requesting user/client
        const widgets = await DashboardWidget.find({
            _id: { $in: widgetIds },
            userId,
            client,
        });
        if (widgets.length !== widgetIds.length) {
            return res.status(403).json({
                message: "Access denied. One or more widgets are not owned by this user/client.",
            });
        }
        const bulkOps = widgetIds.map((widgetId, index) => ({
            updateOne: {
                filter: { _id: widgetId, userId, client },
                update: { order: index },
            },
        }));
        await DashboardWidget.bulkWrite(bulkOps);
        const updatedWidgets = await DashboardWidget.find({ userId, client }).sort({ order: 1 });
        res.status(200).json(updatedWidgets);
    }
    catch (error) {
        console.error("Error in reorderWidgets:", error);
        res.status(500).json({ message: "Failed to reorder widgets" });
    }
};
// GET /api/dashboard/widgets/:id/data - Get mock data for widget
export const getWidgetData = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user._id.toString();
        // @ts-ignore
        const client = req.user.client;
        const { id } = req.params;
        const widget = await DashboardWidget.findById(id);
        if (!widget) {
            return res.status(404).json({ message: "Widget not found" });
        }
        // Validate ownership and tenant access
        if (!validateWidgetOwnership(widget, userId, client)) {
            return res.status(403).json({
                message: "Access denied. You do not have permission to access this widget data.",
            });
        }
        // Generate mock data based on widget type
        const mockData = generateMockData(widget.type);
        res.status(200).json(mockData);
    }
    catch (error) {
        console.error("Error in getWidgetData:", error);
        res.status(500).json({ message: "Failed to fetch widget data" });
    }
};
