import express from "express";
// import { protect } from "../controllers/authentication.js";
import { getAllUsers, getUserById } from "../controllers/user.js";

const router = express.Router();

router.get("/", getAllUsers);

router.get("/:id", getUserById);

export default router;
