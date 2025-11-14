import express from "express";
import { protect } from "../middlewares/protect.js";
import {
  getWidgetData,
  getWidgetDefinition,
  listAvailableWidgets,
} from "../controllers/statistics.js";

const router = express.Router();

router.use(protect);
router.get("/widgets", listAvailableWidgets);
router.get("/widgets/:type/definition", getWidgetDefinition);
router.get("/widgets/:type", getWidgetData);

export default router;
