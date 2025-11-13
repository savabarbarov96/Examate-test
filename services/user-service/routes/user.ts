import express from "express";
import multer from "multer";

import { protect } from "../middlewares/protect.js";
import { checkPermission } from "../middlewares/permissions.js";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
} from "../controllers/user.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// READ
router.get(
  "/",
  protect,
  // checkPermission("users", "view"),
  getAllUsers
);
router.get("/me", protect, getCurrentUser);
router.get(
  "/:id",
  protect,
  // checkPermission("users", "view"),
  getUserById
);

// CREATE
router.post(
  "/",
  protect,
  // checkPermission("users", "create"),
  upload.single("profilePic"),
  createUser
);

// UPDATE
router.put(
  "/:id",
  protect,
  // checkPermission("users", "edit"),
  upload.single("profilePic"),
  updateUser
);

// DELETE
router.delete(
  "/:id",
  // protect,
  // checkPermission("users", "edit"),
  deleteUser
);

export default router;
