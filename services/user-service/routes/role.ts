import express from "express";
import { createRole, getRoles, updateRole, deleteRole } from "../controllers/role.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router.get("/", protect, getRoles);
router.post("/", protect, createRole);
router.patch("/:roleId", protect, updateRole);
router.delete("/:roleId", protect, deleteRole);

export default router;
