import express from "express";
import { protect } from "../middlewares/protect.js";
import { checkPermission } from "../middlewares/permissions.js";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.js";

const router = express.Router();

// READ
router.get("/", protect, 
  // checkPermission("users", "view"), 
  getAllUsers);
router.get("/:id", protect, 
  // checkPermission("users", "view"), 
  getUserById);

// CREATE
router.post("/", protect, 
  // checkPermission("users", "create"), 
  createUser);

// UPDATE
router.put("/:id", protect, 
  // checkPermission("users", "edit"), 
  updateUser);

// DELETE
router.delete("/:id", 
  // protect, 
  checkPermission("users", "edit"),
  deleteUser);

export default router;
