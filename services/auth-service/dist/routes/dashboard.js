import express from "express";
import { protect } from "../controllers/authentication.js";
import { getWidgets, createWidget, updateWidget, deleteWidget, reorderWidgets, getWidgetData, } from "../controllers/dashboard.js";
const router = express.Router();
// All routes are protected with JWT authentication
router.get("/widgets", protect, getWidgets);
router.post("/widgets", protect, createWidget);
router.patch("/widgets/:id", protect, updateWidget);
router.delete("/widgets/:id", protect, deleteWidget);
router.post("/widgets/reorder", protect, reorderWidgets);
router.get("/widgets/:id/data", protect, getWidgetData);
export default router;
