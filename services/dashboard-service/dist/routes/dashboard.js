import express from "express";
import { protect } from "../middlewares/protect.js";
import { getWidgets, createWidget, updateWidget, deleteWidget, reorderWidgets, getWidgetData, } from "../controllers/dashboard.js";
const router = express.Router();
// All routes are protected with JWT authentication
// IMPORTANT: Register specific routes BEFORE parameterized routes
// to prevent Express from matching specific paths to :id parameters
router.get("/widgets", protect, getWidgets);
router.post("/widgets", protect, createWidget);
router.post("/widgets/reorder", protect, reorderWidgets);
router.get("/widgets/:id/data", protect, getWidgetData);
router.patch("/widgets/:id", protect, updateWidget);
router.delete("/widgets/:id", protect, deleteWidget);
export default router;
