import DashboardWidget from "../models/DashboardWidget.js";
import User from "../models/User.js";
import { fetchWidgetDataFromStatistics } from "../utils/statisticsClient.js";
// Validation helper: Check if widget belongs to user and client
const validateWidgetOwnership = (widget, userId, client) => {
    return widget.userId.toString() === userId && widget.client === client;
};
const normalizeLegendPayload = (legend) => {
    if (!legend) {
        return undefined;
    }
    if (legend instanceof Map) {
        return legend;
    }
    return new Map(Object.entries(legend));
};
const resolveClientId = async (req) => {
    var _a, _b;
    const existingClient = (_a = req.user) === null || _a === void 0 ? void 0 : _a.client;
    if (existingClient) {
        return existingClient;
    }
    const headerClientRaw = req.headers["x-client-id"] ?? req.headers["client-id"] ?? req.headers["client"];
    const headerClient = Array.isArray(headerClientRaw) ? headerClientRaw[0] : headerClientRaw;
    if (headerClient) {
        if (!req.user) {
            req.user = { client: headerClient };
        }
        else {
            req.user.client = headerClient;
        }
        return headerClient;
    }
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId) {
        return null;
    }
    const user = await User.findById(userId).select("client");
    if (user?.client) {
        req.user.client = user.client;
        return user.client;
    }
    return null;
};
// GET /api/dashboard/widgets - List user's widgets
export const getWidgets = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user._id;
        const client = await resolveClientId(req);
        if (!client) {
            return res.status(400).json({ message: "Client identifier is required" });
        }
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
        const client = await resolveClientId(req);
        if (!client) {
            return res.status(400).json({ message: "Client identifier is required" });
        }
        const { type, title, legendVisibility, dataSourceParams } = req.body;
        const normalizedLegend = normalizeLegendPayload(legendVisibility);
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
            legendVisibility: normalizedLegend ?? undefined,
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
        const client = await resolveClientId(req);
        if (!client) {
            return res.status(400).json({ message: "Client identifier is required" });
        }
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
        if (legendVisibility !== undefined) {
            widget.legendVisibility = normalizeLegendPayload(legendVisibility) ?? new Map();
        }
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
        const client = await resolveClientId(req);
        if (!client) {
            return res.status(400).json({ message: "Client identifier is required" });
        }
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
        const client = await resolveClientId(req);
        if (!client) {
            return res.status(400).json({ message: "Client identifier is required" });
        }
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
        const client = await resolveClientId(req);
        if (!client) {
            return res.status(400).json({ message: "Client identifier is required" });
        }
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
        const jwtToken = req.cookies?.jwt;
        const widgetData = await fetchWidgetDataFromStatistics(widget.type, jwtToken);
        res.status(200).json(widgetData);
    }
    catch (error) {
        console.error("Error in getWidgetData:", error);
        res.status(500).json({ message: "Failed to fetch widget data" });
    }
};
